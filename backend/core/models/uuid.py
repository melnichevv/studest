from uuid import uuid4

from django.db import models


class UuidMixin(models.Model):
    uuid = models.UUIDField(default=uuid4)

    class Meta:
        abstract = True
