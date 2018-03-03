import uuid
from collections import Callable

from django.db import models
from django.core import validators
from django.utils.encoding import force_text
from django.utils.translation import ugettext_lazy as _
from django.utils.deconstruct import deconstructible


class UUIDField(models.CharField):
    """
    Unique identifier field, using Python's UUID library
    """

    def __init__(self, *args, **kwargs):
        kwargs['blank'] = True
        kwargs['max_length'] = 32
        self.generate_if_blank = kwargs.pop('generate_if_blank', True)

        super().__init__(self, *args, **kwargs)

    def pre_save(self, model_instance, add):
        # Only set on creation if already blank.
        if self.generate_if_blank and not getattr(model_instance, self.attname):
            value = uuid.uuid4().hex
            setattr(model_instance, self.attname, value)
            return value
        else:
            return super().pre_save(model_instance, add)

    def deconstruct(self):
        """
        Returns enough information to recreate the field as a 4-tuple:
         * The name of the field on the model, if contribute_to_class has been run
         * The import path of the field, including the class: django.db.models.IntegerField
           This should be the most portable version, so less specific may be better.
         * A list of positional arguments
         * A dict of keyword arguments
        """

        name, path, args, kwargs = super(models.CharField, self).deconstruct()
        path = "yunojuno.apps.core.db.fields.UUIDField"

        del kwargs['blank']
        del kwargs['max_length']

        return (
            force_text(self.name, strings_only=True),
            path,
            args,
            kwargs,
        )
