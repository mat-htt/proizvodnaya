from django.contrib import admin
from .models import Group, StudentProfile, Test, Question, Choice, TestSubmission, StudentResponse, Lecture

admin.site.register(Group)
admin.site.register(StudentProfile)
admin.site.register(Test)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(TestSubmission)
admin.site.register(StudentResponse)

@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'related_test')
    prepopulated_fields = {'slug': ('title',)}