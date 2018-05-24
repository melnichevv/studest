from django.contrib import admin
from django.utils.translation import ugettext_lazy as _

from .models import Answer, Question, Test, TestResult, QuestionAnswer, Label


class AnswerInline(admin.TabularInline):
    readonly_fields = ('uuid',)
    exclude = ('uuid', )
    model = Answer
    extra = 1
    min_num = 1


class QuestionAdmin(admin.ModelAdmin):
    inlines = [
        AnswerInline,
    ]
    readonly_fields = ('uuid',)
    list_filter = ('labels__name', )

    # class Media:
    #     css = {
    #         'all': ('css/base.css',)
    #     }


class TestResultAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('test', 'user', 'status', 'result', 'start_time', 'end_time', 'uuid')}),
    )

    def get_fieldsets(self, request, obj=None):
        if obj:
            self.readonly_fields = ('uuid', 'test', 'user')
        fieldsets = super(TestResultAdmin, self).get_fieldsets(request, obj)[:]
        if obj is None:
            return (
                (None, {'fields': ('test', 'user')}),
            )
        return fieldsets


class QuestionInline(admin.TabularInline):
    model = Test.questions.through
    verbose_name = _('question')
    verbose_name_plural = _('questions')
    extra = 1


class TestResultInline(admin.TabularInline):
    model = TestResult
    exclude = ('start_time', 'end_time', 'uuid')
    verbose_name = _('test result')
    verbose_name_plural = _('test result')
    extra = 1


class TestAdmin(admin.ModelAdmin):
    change_list_template = 'admin/tests/changelist.html'
    inlines = [
        QuestionInline,
        TestResultInline
    ]
    readonly_fields = ('uuid',)
    exclude = ('questions',)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'name',
                'description',
                'status',
                'minutes',
                'start_at',
                'end_at',
                'automatic_start',
                'accessible_by'
            ),
        }),
    )

    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)

    # def get_inline_formsets(self, request, formsets, inline_instances, obj=None):
    #     if not obj:
    #         return []
    #     return super().get_inline_formsets(request, formsets, inline_instances, obj)


class QuestionAnswerAdmin(admin.ModelAdmin):
    list_filter = ('result', 'correct')


class AnswerAdmin(admin.ModelAdmin):
    list_display = ('text', 'question')


admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(Test, TestAdmin)
admin.site.register(Label)
admin.site.register(TestResult, TestResultAdmin)
admin.site.register(QuestionAnswer, QuestionAnswerAdmin)
