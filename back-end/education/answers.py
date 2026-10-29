"""Сравнение открытых ответов ученика с эталоном.

Числовые ответы сравниваются по значению, поэтому «-1/25», «−0,04» и «-0.040»
считаются одним и тем же ответом. Всё остальное сравнивается как текст
без учёта регистра и лишних пробелов.
"""
from fractions import Fraction
import re

_MINUSES = str.maketrans({'−': '-', '–': '-', '—': '-'})


def _normalize_text(value):
    value = (value or '').translate(_MINUSES).strip().lower()
    return re.sub(r'\s+', '', value)


def _to_number(value):
    text = _normalize_text(value).replace(',', '.')
    # Ответ вида «x = 5» тоже засчитываем
    if '=' in text:
        text = text.rsplit('=', 1)[1]
    if not text:
        return None
    try:
        if text.count('/') == 1:
            num, den = text.split('/')
            return Fraction(num) / Fraction(den)
        return Fraction(text)
    except (ValueError, ZeroDivisionError):
        return None


def answers_match(user_answer, correct_answer):
    if not correct_answer:
        return False
    user_num, correct_num = _to_number(user_answer), _to_number(correct_answer)
    if user_num is not None and correct_num is not None:
        return user_num == correct_num
    return _normalize_text(user_answer) == _normalize_text(correct_answer)
