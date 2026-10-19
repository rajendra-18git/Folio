import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.db_models import EvaluationRun, EvaluationTestCase
from app.schemas.api_schemas import (
    EvaluationRunRequest, EvaluationRunResponse, TestCaseCreateRequest,
    TestCaseResponse, EvalResultDetail
)
from app.services.eval_service import eval_service

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

def format_eval_run(r: EvaluationRun) -> EvaluationRunResponse:
    details_list = []
    if r.results_details:
        try:
            details_list = [EvalResultDetail(**item) for item in json.loads(r.results_details)]
        except Exception:
            details_list = []

    return EvaluationRunResponse(
        id=r.id,
        name=r.name,
        test_cases_count=r.test_cases_count,
        citation_validity_score=r.citation_validity_score,
        page_validity_score=r.page_validity_score,
        retrieval_relevance_score=r.retrieval_relevance_score,
        answer_completeness_score=r.answer_completeness_score,
        avg_latency_ms=r.avg_latency_ms,
        total_tokens=r.total_tokens,
        estimated_cost_usd=r.estimated_cost_usd,
        details=details_list,
        created_at=r.created_at
    )

@router.post("/run", response_model=EvaluationRunResponse)
def trigger_evaluation_run(request: EvaluationRunRequest, db: Session = Depends(get_db)):
    try:
        run = eval_service.run_evaluations(
            db=db,
            name=request.name or "Benchmark Run",
            test_case_ids=request.test_case_ids
        )
        return format_eval_run(run)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[EvaluationRunResponse])
def list_evaluation_runs(db: Session = Depends(get_db)):
    runs = db.query(EvaluationRun).order_by(EvaluationRun.created_at.desc()).all()
    return [format_eval_run(r) for r in runs]

@router.get("/test-cases", response_model=List[TestCaseResponse])
def list_test_cases(db: Session = Depends(get_db)):
    tcs = db.query(EvaluationTestCase).order_by(EvaluationTestCase.created_at.desc()).all()
    result = []
    for tc in tcs:
        pages = json.loads(tc.expected_pages) if tc.expected_pages else []
        keywords = json.loads(tc.expected_keywords) if tc.expected_keywords else []
        result.append(TestCaseResponse(
            id=tc.id,
            question=tc.question,
            expected_doc_id=tc.expected_doc_id,
            expected_doc_title=tc.expected_doc_title,
            expected_pages=pages,
            expected_keywords=keywords,
            created_at=tc.created_at
        ))
    return result

@router.post("/test-cases", response_model=TestCaseResponse)
def create_test_case(request: TestCaseCreateRequest, db: Session = Depends(get_db)):
    tc = EvaluationTestCase(
        question=request.question,
        expected_doc_id=request.expected_doc_id,
        expected_doc_title=request.expected_doc_title,
        expected_pages=json.dumps(request.expected_pages),
        expected_keywords=json.dumps(request.expected_keywords)
    )
    db.add(tc)
    db.commit()
    db.refresh(tc)
    return TestCaseResponse(
        id=tc.id,
        question=tc.question,
        expected_doc_id=tc.expected_doc_id,
        expected_doc_title=tc.expected_doc_title,
        expected_pages=request.expected_pages,
        expected_keywords=request.expected_keywords,
        created_at=tc.created_at
    )
