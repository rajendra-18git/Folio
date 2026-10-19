"""
Pure-Python fallback shim for orjson to prevent DLL loading blocks under Windows Application Control policies.
"""
import json
import datetime
import uuid

OPT_INDENT_2 = 1
OPT_NAIVE_UTC = 2
OPT_NON_STR_KEYS = 4
OPT_OMIT_MICROSECONDS = 8
OPT_PASSTHROUGH_DATACLASS = 16
OPT_PASSTHROUGH_DATETIME = 32
OPT_PASSTHROUGH_SUBCLASS = 64
OPT_SERIALIZE_DATACLASS = 128
OPT_SERIALIZE_NUMPY = 256
OPT_SERIALIZE_UUID = 512
OPT_SORT_KEYS = 1024
OPT_STRICT_INTEGER = 2048
OPT_UTC_Z = 4096

JSONDecodeError = json.JSONDecodeError
JSONEncodeError = TypeError

def _default_encoder(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    if isinstance(obj, uuid.UUID):
        return str(obj)
    if hasattr(obj, "item"):  # numpy scalars
        return obj.item()
    if hasattr(obj, "tolist"):  # numpy arrays
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def dumps(obj, default=None, option=None):
    def combined_default(o):
        if default:
            try:
                return default(o)
            except Exception:
                pass
        return _default_encoder(o)

    indent = 2 if (option and (option & OPT_INDENT_2)) else None
    sort_keys = bool(option and (option & OPT_SORT_KEYS))
    res_str = json.dumps(obj, default=combined_default, indent=indent, sort_keys=sort_keys)
    return res_str.encode("utf-8")

def loads(s):
    if isinstance(s, (bytes, bytearray)):
        s = s.decode("utf-8")
    return json.loads(s)
