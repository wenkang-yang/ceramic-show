"""《依据》文件夹路径解析：本站数据与图像均只认此目录内文件。"""
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
YIJU_DIR = PROJECT_ROOT / "依据"


def require_yiju_dir() -> Path:
    if not YIJU_DIR.is_dir():
        raise FileNotFoundError(f"缺少《依据》文件夹：{YIJU_DIR}")
    return YIJU_DIR


def find_cards_document() -> Path:
    """《陶瓷器物图片分类卡片版》（.doc / .docx，OOXML 内嵌）。"""
    require_yiju_dir()
    for pat in ("*分类卡片*.doc", "*分类卡片*.docx"):
        found = sorted(YIJU_DIR.glob(pat))
        if found:
            return found[0]
    raise FileNotFoundError(f"在 {YIJU_DIR} 中未找到名称含「分类卡片」的 Word 文件")


def find_baobiao_document() -> Path:
    """《中国陶瓷文物分类体系汇报表》等器物清单主表。"""
    require_yiju_dir()
    for p in sorted(YIJU_DIR.glob("*.doc")) + sorted(YIJU_DIR.glob("*.docx")):
        if "分类卡片" in p.name:
            continue
        if "汇报" in p.name or "体系" in p.name:
            return p
    raise FileNotFoundError(f"在 {YIJU_DIR} 中未找到汇报表类 Word 文件（名称含「汇报」或「体系」）")
