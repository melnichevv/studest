from bleach import clean as bleach_clean

from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.urls import reverse
from django.utils.translation import ugettext as _
from django.utils.safestring import mark_safe

from profiles.models import StudentProfile, TeacherProfile


class StudentProfileAdmin(ModelAdmin):
    inlines = (
    )
    fields = (
        'user',
        'last_visited_at',
        'created_at'
    )
    list_display = (
        'name_display',
        'date_registered',
        'last_visited_at'
    )
    search_fields = (
        'user__first_name',
        'user__last_name',
    )
    autocomplete_fields = ['user']
    readonly_fields = (
        'created_at',
        'last_visited_at'
    )
    ordering = ('-id',)

    def date_registered(self, obj: StudentProfile):
        """Return the date_joined of the underlying user."""
        return obj.user.date_joined

    def name_display(self, obj: StudentProfile):
        """Format the user for display: First Last (impersonate)"""
        safe_name = bleach_clean(obj.user.get_full_name())
        link = "%s (<a href='%s' target='_blank'>impersonate</a>)" % (
            safe_name,
            reverse('impersonate-start', args=[obj.user.id]),
        )
        return mark_safe(link)

    name_display.short_description = _("Full Name")

    def get_fieldsets(self, request, obj=None):
        """
        Hook for specifying fieldsets.
        """
        if obj is None:
            return [(None, {'fields': ('user',)})]
        if self.fieldsets:
            return self.fieldsets
        return [(None, {'fields': self.get_fields(request, obj)})]

    def last_visited_at(self, obj: StudentProfile):
        if obj.user.last_visited_at is None:
            return _('Never')
        return obj.user.last_visited_at

    name_display.short_description = _("Last Visited At")


admin.site.register(StudentProfile, StudentProfileAdmin)


class TeacherProfileAdmin(ModelAdmin):
    inlines = (
    )
    fields = (
        'user',
        'last_visited_at',
        'created_at'
    )
    list_display = (
        'name_display',
        'date_registered',
        'last_visited_at'
    )
    search_fields = (
        'user__first_name',
        'user__last_name',
    )
    autocomplete_fields = ['user']
    readonly_fields = (
        'created_at',
        'last_visited_at'
    )
    ordering = ('-id',)

    def date_registered(self, obj: TeacherProfile):
        """Return the date_joined of the underlying user."""
        return obj.user.date_joined

    def name_display(self, obj: TeacherProfile):
        """Format the user for display: First Last (impersonate)"""
        safe_name = bleach_clean(obj.user.get_full_name())
        link = "%s (<a href='%s' target='_blank'>impersonate</a>)" % (
            safe_name,
            reverse('impersonate-start', args=[obj.user.id]),
        )
        return mark_safe(link)

    name_display.short_description = _("Full Name")

    def get_fieldsets(self, request, obj=None):
        """
        Hook for specifying fieldsets.
        """
        if obj is None:
            return [(None, {'fields': ('user',)})]
        if self.fieldsets:
            return self.fieldsets
        return [(None, {'fields': self.get_fields(request, obj)})]

    def last_visited_at(self, obj: StudentProfile):
        if obj.user.last_visited_at is None:
            return _('Never')
        return obj.user.last_visited_at

    name_display.short_description = _("Last Visited At")


admin.site.register(TeacherProfile, TeacherProfileAdmin)
