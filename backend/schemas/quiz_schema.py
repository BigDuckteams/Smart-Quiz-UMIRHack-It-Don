"""Marshmallow schema for strict server-side quiz validation."""

from __future__ import annotations

from marshmallow import Schema, ValidationError, fields, validate, validates

ROOM_TYPES = [
    'Квартира',
    'Частный дом',
    'Офис',
    'Коммерческое помещение',
    'Студия / апартаменты',
    'Другое',
]

ZONES = [
    'Кухня',
    'Гостиная',
    'Спальня',
    'Детская',
    'Санузел',
    'Прихожая',
    'Кабинет',
    'Гардеробная',
    'Балкон / лоджия',
    'Полностью всё помещение',
]

STYLES = ['Современный', 'Минимализм', 'Скандинавский', 'Лофт', 'Неоклассика', 'Классика', 'Пока не определился']
BUDGETS = ['До 500 000 ₽', '500 000 – 1 000 000 ₽', '1 000 000 – 2 000 000 ₽', 'От 2 000 000 ₽', 'Пока не знаю']


class QuizSchema(Schema):
    room_type = fields.Str(required=True, validate=validate.OneOf(ROOM_TYPES))
    zones = fields.List(fields.Str(validate=validate.OneOf(ZONES)), required=True, validate=validate.Length(min=1, max=10))
    area = fields.Int(required=True, validate=validate.Range(min=20, max=300))
    style = fields.Str(required=True, validate=validate.OneOf(STYLES))
    budget = fields.Str(required=True, validate=validate.OneOf(BUDGETS))
    name = fields.Str(load_default='', validate=validate.Length(max=120))
    phone = fields.Str(required=True, validate=[validate.Length(min=7, max=25), validate.Regexp(r'^[+()\-\s\d]{7,25}$')])
    email = fields.Str(load_default='', validate=validate.Length(max=254))
    comment = fields.Str(load_default='', validate=validate.Length(max=1200))
    page_url = fields.Url(load_default='')
    utm_source = fields.Str(load_default='', validate=validate.Length(max=120))
    timestamp = fields.DateTime(required=True)
    consent = fields.Bool(required=True, truthy={True})

    @validates('area')
    def validate_area_step(self, value: int) -> None:
        if value % 5 != 0:
            raise ValidationError('Area must increment by 5')

    @validates('email')
    def validate_email_optional(self, value: str) -> None:
        if value and '@' not in value:
            raise ValidationError('Invalid email format')
