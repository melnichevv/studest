from django.contrib.postgres.fields import JSONField
from django.db import models
from django.http import Http404
from django.utils import timezone
from django.utils.translation import ugettext as _
from model_utils.models import TimeStampedModel

from core.models.uuid import UuidMixin
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


class Question(UuidMixin, TimeStampedModel):
    RADIO = 'radio'
    CHECKBOX = 'checkbox'
    TEXT = 'text'
    TYPE_CHOICES = (
        ('radio', _('One Answer')),
        ('checkbox', _('Multiple Answers')),
        ('text', _('String Answer')),
    )
    type = models.CharField(
        _('type'),
        max_length=30,
        choices=TYPE_CHOICES,
        default=TYPE_CHOICES[0][0]
    )
    question = models.TextField()
    labels = models.ManyToManyField(Label, blank=True, verbose_name=_('labels'))
    video_url = models.CharField(_('video URL'), max_length=255, blank=True, null=True)
    img_url = models.CharField(_('image URL'), max_length=255, blank=True, null=True)
    audio_url = models.CharField(_('audio URL'), max_length=255, blank=True, null=True)
    other_url = models.CharField(_('other URL'), max_length=255, blank=True, null=True)
    manual_check = models.BooleanField(
        _('defines whether answer to this question should be manually approved'),
        default=False
    )

    def __str__(self):
        return f"{self.question} [{self.type}]"

    @property
    def all_answers(self):
        return self.answers.order_by('pk').all()

    @property
    def correct_answers(self):
        return self.answers.filter(correct=True).order_by('pk')

    @property
    def correct_answers_pk(self):
        return self.answers.filter(correct=True).values_list('pk', flat=True).order_by('pk')

    @property
    def random_answers(self):
        return self.answers.order_by('?')

    def check_if_correct(self, pre_answer, expanded=False):
        correct = None
        if self.type == self.RADIO:
            correct_answer = self.correct_answers.first()
            answer = int(pre_answer[0])
            if correct_answer.pk == answer:
                return True
            if expanded:
                correct = correct_answer
        elif self.type == self.CHECKBOX:
            correct_answers = self.correct_answers
            answer = (int(x) for x in pre_answer)
            if set(answer) == set(correct_answers.values_list('pk', flat=True)):
                return True
            if expanded:
                correct = correct_answers
        elif self.type == self.TEXT:
            correct_answer = self.correct_answers.first()
            if pre_answer[0] == correct_answer.text:
                return True
            if expanded:
                correct = correct_answer
        if not expanded:
            return False
        return False, correct


class Answer(UuidMixin, TimeStampedModel):
    """
    Answer model
    """
    text = models.TextField(_('text'))
    question = models.ForeignKey(
        'Question',
        verbose_name=Question._meta.verbose_name_plural,
        related_name='answers',
        on_delete=models.CASCADE
    )
    correct = models.BooleanField(_('correct'), default=False)

    class Meta:
        verbose_name = _('answer')
        verbose_name_plural = _('answers')

    def __str__(self):
        return self.text


class Test(UuidMixin, TimeStampedModel):
    """
    Test model
    """
    ACCESSIBLE_BY_ANYONE = 'anyone'
    ACCESSIBLE_BY_INVITE = 'invite'
    ACCESSIBLE_BY_CHOICES = (
        (ACCESSIBLE_BY_ANYONE, _('Anyone')),
        (ACCESSIBLE_BY_INVITE, _('Invite')),
    )

    STATUS_OPEN = 'open'
    STATUS_CLOSED = 'closed'
    STATUS_CHOICES = (
        (STATUS_OPEN, _('Open')),
        (STATUS_CLOSED, _('Closed')),
    )

    status = models.CharField(
        _('status'),
        max_length=50,
        choices=STATUS_CHOICES,
        default=STATUS_OPEN
    )
    name = models.CharField(_('name'), max_length=255, default='')
    questions = models.ManyToManyField(
        Question,
        verbose_name=Question._meta.verbose_name_plural,
        related_name='tests'
    )
    minutes = models.IntegerField(
        _('allowed time'),
        default=0,
        help_text=_('Allowed time for fulfilling the test')
    )
    labels = models.ManyToManyField(
        Label,
        verbose_name=_('labels'),
        blank=True
    )
    description = models.TextField(_('description'), null=True, blank=True)
    automatic_start = models.BooleanField(_('should test start automatically'), default=False)
    start_at = models.DateTimeField(_('start at'))
    accessible_by = models.CharField(
        _('accessible by'),
        max_length=50,
        choices=ACCESSIBLE_BY_CHOICES,
        default=ACCESSIBLE_BY_ANYONE,
        help_text=_('Who can pass this test?')
    )

    class Meta:
        verbose_name = _('test')
        verbose_name_plural = _('tests')

    def __str__(self):
        return self.name

    @property
    def random_questions(self):
        return self.questions.order_by('?')


class TestResult(UuidMixin, TimeStampedModel):
    """
    Test Answers model
    """
    NEW = 'new'
    IN_PROGRESS = 'in_progress'
    REQUIRES_REVIEW = 'requires_review'
    DONE = 'done'
    STATUS_CHOICES = (
        (NEW, _('New')),
        (IN_PROGRESS, _('In progress')),
        (REQUIRES_REVIEW, _('Required review')),
        (DONE, _('Done')),
    )
    test = models.ForeignKey(
        Test,
        verbose_name=Test._meta.verbose_name,
        related_name='solved_tests',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        verbose_name=User._meta.verbose_name,
        related_name='tests',
        on_delete=models.CASCADE
    )
    result = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        verbose_name=_('result'),
        null=True,
        blank=True
    )
    start_time = models.DateTimeField(_('start time'), null=True, blank=True)
    end_time = models.DateTimeField(_('end time'), null=True, blank=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=NEW
    )
    uuid = models.CharField(
        max_length=36,
        unique=True,
        db_index=True,
        default=generate_uuid,
        verbose_name=_('Unique Identifier'),
        help_text=_("The unique identifier for this object"))

    class Meta:
        verbose_name = _('test answers')
        verbose_name_plural = _('test answers')
        ordering = ('pk',)
        unique_together = ('test', 'user')

    @property
    def name(self):
        return self.test.name

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
        if self.test.questions.filter(manual_check=True).exists():
            self.status = self.REQUIRES_REVIEW
        else:
            self.status = self.DONE
        self.calculate_results()
        self.save(update_fields=['end_time', 'status'])
        return self

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
        return f'{self.test.name} - {self.user.get_full_name()}'

    @property
    def correct_answers(self):
        return self.answers.filter(correct=True)


class QuestionAnswer(UuidMixin, TimeStampedModel):
    question = models.ForeignKey(
        Question,
        verbose_name=_('question'),
        related_name='user_answers',
        on_delete=models.CASCADE
    )
    student = models.ForeignKey(
        User,
        verbose_name=_('student'),
        related_name='user_answers',
        on_delete=models.CASCADE
    )
    answer = JSONField()
    correct = models.NullBooleanField(null=True)
    result = models.ForeignKey(
        TestResult,
        verbose_name=TestResult._meta.verbose_name,
        related_name=_('answers'),
        on_delete=models.CASCADE
    )

    @classmethod
    def get_or_create(cls, question, student, result, answer, correct=None):
        """
        Gets existing question answer or create a new one if it doesn't exist
        """
        qa = QuestionAnswer.objects.filter(question=question, student=student,
                                           result=result).first()
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

    @property
    def raw_answers(self):
        if self.question.type == self.question.RADIO:
            return
        return
