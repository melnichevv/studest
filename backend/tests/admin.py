from django.contrib import admin
from django.utils.translation import ugettext_lazy as _

from .models import Answer, Question, Test, TestResult, QuestionAnswer, Label


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 1
    min_num = 1


class QuestionAdmin(admin.ModelAdmin):
    inlines = [
        AnswerInline,
    ]
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
    exclude = ('questions',)


class QuestionAnswerAdmin(admin.ModelAdmin):
    list_filter = ('result', 'correct')


admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer)
admin.site.register(Test, TestAdmin)
admin.site.register(Label)
admin.site.register(TestResult, TestResultAdmin)
admin.site.register(QuestionAnswer, QuestionAnswerAdmin)
