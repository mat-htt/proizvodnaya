from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0003_lecture_content_lecture_video_url_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='series',
            field=models.CharField(blank=True, max_length=255, verbose_name='Серия (контрольная)'),
        ),
        migrations.AddField(
            model_name='test',
            name='variant',
            field=models.PositiveSmallIntegerField(blank=True, null=True, verbose_name='Номер варианта'),
        ),
    ]
