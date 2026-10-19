'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  MessageSquareText,
  GraduationCap,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchDocs = async () => {
    try {
      const data = await api.listDocuments();
      setDocuments(data);
    } catch {
      showToast('Failed to load documents list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Only PDF files are supported.', 'error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast('File exceeds 25MB limit.', 'error');
      return;
    }

    setUploading(true);
    showToast(`Uploading and chunking '${file.name}'...`, 'info');
    try {
      const doc = await api.uploadDocument(file);
      showToast(`'${doc.original_filename}' successfully indexed!`, 'success');
      fetchDocs();
    } catch (err: any) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!docToDelete) return;
    const { id, original_filename: name } = docToDelete;
    setIsDeleting(true);
    try {
      await api.deleteDocument(id);
      showToast(`'${name}' deleted successfully.`, 'success');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setDocToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Could not delete document.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Document Library</h2>
          <p className="text-sm text-slate-500">
            Upload and manage your PDF sources for grounded intelligence and study preparation.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50 shadow-inner'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="p-4 w-fit mx-auto rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-base">
              {uploading ? 'Processing & Indexing PDF...' : 'Drag and drop your PDF here'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard PDFs up to 25MB. Page numbers, text blocks, and vector embeddings are extracted automatically.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-600/20 transition disabled:opacity-50"
            >
              Select PDF File
            </button>
          </div>
        </div>
      </div>

      {/* Search and Table Area */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredDocs.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            Loading documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No matching documents found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-[220px]" title={doc.original_filename}>
                        {doc.original_filename}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{doc.page_count} pages</td>
                    <td className="py-3.5 px-4">{doc.chunk_count} chunks</td>
                    <td className="py-3.5 px-4">{(doc.file_size_bytes / 1024).toFixed(1)} KB</td>
                    <td className="py-3.5 px-4">
                      {doc.status === 'ready' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      ) : doc.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Error
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/workspace?doc=${doc.id}`}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Chat with document"
                      >
                        <MessageSquareText className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/study?doc=${doc.id}`}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Study Tools"
                      >
                        <GraduationCap className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/multimodal?doc=${doc.id}`}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                        title="Visual Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <a
                        href={`http://localhost:8000/api/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Delete Document</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">{docToDelete.original_filename}</strong>? All extracted chunks, page images, and vector embeddings will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
