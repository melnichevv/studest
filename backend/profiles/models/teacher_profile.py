from django.db import models
from django.conf import settings
from core.db.bases import AbstractBaseModel


class TeacherProfile(AbstractBaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name='teacher',
        on_delete=models.CASCADE
    )

    class Meta:
        ordering = ['id']
        get_latest_by = 'created_at'

    def __str__(self):
        return self.full_name

    def __repr__(self):
        return f'<TeacherProfile pk={self.pk}>'

    @property
    def full_name(self):
        return self.user.get_full_name()
