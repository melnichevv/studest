from bleach import clean as bleach_clean
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext as _
from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.urls import reverse

from users.models import User


class UserAdmin(ModelAdmin):
    list_display = (
        # 'get_full_name',
        'name_display',
        'last_visited_at',
        'date_registered',
    )

    search_fields = (
        'user__first_name',
        'user__last_name',
    )
    # autocomplete_fields = ['user']
    # readonly_fields = (
    #     'created_at',
    #     'approved_at',
    #     'last_updated_at',
    #     'notifications_counter',
    #     'thumbs_up',
    #     'thumbs_down',
    #     'abs_quarter',
    #     'abs_month',
    #     'last_activity_at',
    #     'last_password_change_at',
    #     'registration_metadata',
    # )
    ordering = ('-id',)

    def date_registered(self, obj: User):
        """Return the date_joined of the underlying user."""
        return obj.date_joined

    def name_display(self, obj: User):
        """Format the user for display: First Last (impersonate)"""
        safe_name = bleach_clean(obj.get_full_name())
        link = "%s (<a href='%s' target='_blank'>impersonate</a>)" % (
            safe_name,
            reverse('impersonate-start', args=[obj.id]),
        )
        return mark_safe(link)

    name_display.short_description = _("Full Name")

    def get_fieldsets(self, request, obj=None):
        """
        Hook for specifying fieldsets.
        """
        if obj is None:
            return [(None, {'fields': ('first_name', 'last_name', 'email', 'password')})]
        if self.fieldsets:
            return self.fieldsets
        return [(None, {'fields': self.get_fields(request, obj)})]


admin.site.register(User, UserAdmin)
