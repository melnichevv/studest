import uuid

from django.db import models
from django.db.models import Q
from django.utils.timezone import now as tz_now

LIVE = 1
SOFT_DELETED = 2

BASE_STATUSES = (
    (LIVE, "Live"),
    (SOFT_DELETED, "Hidden"),
)


class FilterMixinBase():
    """
    Base class used by Filter mixins.
    """

    def _get_queryset(self):
        """
        Returns the underlying queryset from Manager or QuerySet object.
        """
        if issubclass(type(self), models.query.QuerySet):
            return self
        elif issubclass(type(self), models.Manager):
            return self.get_queryset()
        else:
            raise Exception(
                "Object %s of type <%s> does not contain queryset."
                % (self, type(self)))


class StatusBaseFilterMixin(FilterMixinBase):
    """
    QuerySet and Manager mixin for filtering by live/hidden state
    of a model that subclasses yunojuno.apps.core.db.StatusBase
    """

    def live(self):
        return self._get_queryset().filter(status=LIVE)

    def hidden(self):
        return self._get_queryset().filter(status=SOFT_DELETED)


class StatusBaseQuerySet(
    StatusBaseFilterMixin,
    models.query.QuerySet
):
    """
    Custom queryset used to allow chaining of custom manager methods.
    """
    pass


class StatusBaseManager(
    StatusBaseFilterMixin,
    models.Manager
):
    def get_queryset(self):
        return StatusBaseQuerySet(self.model, using=self._db)

    def live(self):
        return self.get_queryset().live()

    def hidden(self):
        return self.get_queryset().hidden()


class LiveObjectsManager(models.Manager):
    """
    Custom manager that automatically filters to only show 'live' objects
    """

    def get_queryset(self, *args, **kwargs):
        q = Q(status=LIVE)

        must_contain_id = kwargs.pop('must_contain_id', None)

        if must_contain_id:
            q.add(Q(id=must_contain_id), Q.OR)

        return super(LiveObjectsManager, self).get_queryset().filter(q)

    def filter(self, *args, **kwargs):
        # Look for any specific object we must return, regardless of its status
        must_contain_id = kwargs.pop('must_contain_id', None)
        # pop() here because we don't want to pass it to the
        # real filter() as must_contain_id

        # set up a default q
        q = Q(*args, **kwargs)  # start by filtering for the standard args

        # the call to filter() does't just ask for the args/kwargs filters, but
        # demands that the ORM returns the record with the specified id, too
        get_qs_kwargs = {'must_contain_id': must_contain_id}

        return self.get_queryset(**get_qs_kwargs).filter(q)


class HiddenObjectsManager(models.Manager):
    """
    Custom manager that automatically filters to only show retired objects
    """

    def get_queryset(self):
        return super(HiddenObjectsManager, self).get_queryset().filter(
            status=SOFT_DELETED
        )


class StatusBase(models.Model):
    """
    Abstract base class that contains booleans for soft-deleting/hiding
    models, complete with a custom manager to pre-exclude hidden objects

    Important: see TimestampedBase code comments regarding use of save()

    """
    status = models.IntegerField(
        blank=False,
        null=False,
        choices=BASE_STATUSES,
        default=LIVE
    )

    # in addition to the standard 'objects' manager, we now have...
    objects = StatusBaseManager()
    live_objects = LiveObjectsManager()
    hidden_objects = HiddenObjectsManager()

    class Meta:
        abstract = True

    @property
    def is_live(self):
        return self.status == LIVE

    @property
    def is_hidden(self):
        return self.is_soft_deleted

    @property
    def is_soft_deleted(self):
        return self.status == SOFT_DELETED

    # TODO: clean up all use of hidden/hide etc across codebase
    # and stick with soft_deleted terminology

    def soft_delete(self, **kwargs):
        if not self.is_hidden:
            self.status = SOFT_DELETED
            self.save(**kwargs)

    def hide(self, **kwargs):
        # alias for soft_delete
        return self.soft_delete(**kwargs)

    def revert_soft_delete(self, **kwargs):
        should_save = kwargs.pop('save', True)
        if self.is_hidden:
            self.status = LIVE

            if should_save:
                self.save(**kwargs)

    def unhide(self, **kwargs):
        # alias for revert_soft_delete
        return self.revert_soft_delete(**kwargs)


class AbstractBaseModel(models.Model):
    """Abstract base class for UT models.

    Adds timestamps, and uuid field.
    """
    # unique id, used for API operations
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    # timestamp set on the first save() method call
    created_at = models.DateTimeField(blank=True, null=True, db_index=True)
    # timestamp set on subsequent save() method calls
    last_updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        abstract = True

    def __repr__(self):
        raise NotImplementedError

    def __str__(self):
        raise NotImplementedError

    def save(self, *args, **kwargs):
        """Sets timestamps."""
        # if we explicitly only want certain fields, then bypass the
        # additional field setting
        if 'update_fields' in kwargs:
            super(AbstractBaseModel, self).save(*args, **kwargs)
            return self
        now = tz_now()
        self.created_at = self.created_at or now
        self.last_updated_at = now
        super(AbstractBaseModel, self).save(*args, **kwargs)
        return self
