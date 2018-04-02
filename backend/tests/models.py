from django.contrib.postgres.fields import JSONField
from django.db import models
from django.http import Http404
from django.utils import timezone
from django.utils.translation import ugettext as _
from model_utils.models import TimeStampedModel

from core.utils import generate_uuid
from users.models import User


class Label(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=50)

    class Meta:
        verbose_name = _('label')
        verbose_name_plural = _('labels')

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class Question(TimeStampedModel):
    RADIO = 'radio'
    CHECKBOX = 'checkbox'
    TEXT = 'text'
    TYPE_CHOICES = (
        ('radio', _('One Answer')),
        ('checkbox', _('Multiple Answers')),
        ('text', _('String Answer')),
    )
    type = models.CharField(_('type'), max_length=30, choices=TYPE_CHOICES, default=TYPE_CHOICES[0][0])
    question = models.TextField()
    labels = models.ManyToManyField(Label, blank=True, verbose_name=Label._meta.verbose_name_plural)
    video_url = models.CharField(_('video URL'), max_length=255, blank=True, null=True)
    img_url = models.CharField(_('image URL'), max_length=255, blank=True, null=True)
    audio_url = models.CharField(_('audio URL'), max_length=255, blank=True, null=True)
    other_url = models.CharField(_('other URL'), max_length=255, blank=True, null=True)


class Answer(TimeStampedModel):
    """
    Answer model
    """
    text = models.TextField(_('text'))
    question = models.ForeignKey(
        'Question',
        verbose_name=Question._meta.verbose_name,
        related_name=_('answers'),
        on_delete=models.CASCADE
    )
    correct = models.BooleanField(_('correct'), default=False)

    class Meta:
        verbose_name = _('answer')
        verbose_name_plural = _('answers')

    def __str__(self):
        return self.text


class Test(TimeStampedModel):
    """
    Test model
    """
    name = models.CharField(_('name'), max_length=255, default='')
    questions = models.ManyToManyField(Question, verbose_name=Question._meta.verbose_name_plural,
                                       related_name=_('tests'))
    minutes = models.IntegerField(_('allowed time'), default=0, help_text=_('Allowed time for fulfilling the test'))
    labels = models.ManyToManyField(Label, verbose_name=Label._meta.verbose_name_plural, blank=True)
    description = models.TextField(_('description'), null=True, blank=True)

    class Meta:
        verbose_name = _('test')
        verbose_name_plural = _('tests')

    def __str__(self):
        return self.name

    @property
    def random_questions(self):
        return self.questions.order_by('?')


class TestResult(TimeStampedModel):
    """
    Test Answers model
    """
    NEW = 'new'
    IN_PROGRESS = 'in_progress'
    DONE = 'done'
    STATUS_CHOICES = (
        (NEW, _('New')),
        (IN_PROGRESS, _('In progress')),
        (DONE, _('Done')),
    )
    test = models.ForeignKey(Test, verbose_name=Test._meta.verbose_name, related_name=_('solved_tests'),
                             on_delete=models.CASCADE)
    user = models.ForeignKey(User, verbose_name=User._meta.verbose_name, related_name=_('tests'),
                             on_delete=models.CASCADE)
    result = models.DecimalField(max_digits=6, decimal_places=3, verbose_name=_('result'), null=True, blank=True)
    start_time = models.DateTimeField(_('start time'), null=True, blank=True)
    end_time = models.DateTimeField(_('end time'), null=True, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_CHOICES[0][0])
    uuid = models.CharField(max_length=36, unique=True, db_index=True, default=generate_uuid,
                            verbose_name=_("Unique Identifier"), help_text=_("The unique identifier for this object"))

    class Meta:
        verbose_name = _('test answers')
        verbose_name_plural = _('test answers')
        ordering = ('pk',)

    def start(self):
        if self.status != self.NEW:
            raise Http404
        self.start_time = timezone.now()
        self.status = self.IN_PROGRESS
        self.save(update_fields=['start_time', 'status'])
        return

    def finish(self):
        if self.status != self.IN_PROGRESS:
            raise Http404
        self.end_time = timezone.now()
        self.status = self.DONE
        self.calculate_results()
        self.save(update_fields=['end_time', 'status'])
        return

    def calculate_results(self):
        try:
            correct_ans = self.answers.filter(correct=True).count()
            all_ans = self.test.questions.count()
            self.result = round(100. / (all_ans / correct_ans), 2)
        except ZeroDivisionError:
            self.result = 0
        self.save(update_fields=['result'])

    @property
    def str_status(self):
        return dict((t[0], t[1][:]) for t in self.STATUS_CHOICES)[self.status]

    @property
    def is_new(self):
        return self.status == self.NEW

    @property
    def is_in_progress(self):
        return self.status == self.IN_PROGRESS

    @property
    def is_done(self):
        return self.status == self.DONE

    def __str__(self):
        return self.test.name

    @property
    def correct_answers(self):
        return self.answers.filter(correct=True)


class QuestionAnswer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    answer = JSONField()
    correct = models.BooleanField()
    result = models.ForeignKey(
        TestResult,
        verbose_name=TestResult._meta.verbose_name,
        related_name=_('answers'),
        on_delete=models.CASCADE
    )

    @classmethod
    def get_or_create(cls, question, student, result, answer, correct):
        """
        Gets the existing contact field or creates a new field if it doesn't exist
        """
        qa = QuestionAnswer.objects.filter(question=question, student=student, result=result).first()
        if qa:
            qa.answer = answer,
            qa.correct = correct
        else:
            ans_data = {
                'question': question,
                'student': student,
                'result': result,
                'answer': answer,
                'correct': correct,
            }
            qa = QuestionAnswer(**ans_data)
        qa.save()
        return qa
