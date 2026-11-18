import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages", "praman-sdk"))
from praman import PramanDesk

__all__ = ["PramanDesk"]
