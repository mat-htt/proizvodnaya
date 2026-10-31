from django.db import migrations, models

# Обложки лекций в едином стиле лежат во frontend: public/images/covers/<slug>.svg
COVERS = [
    'opredelenie-proizvodnoy1',
    'pravila-vychisleniya-proizvodnyh',
    'geometricheskij-smysl-proizvodnoj',
    'vozrastanie-i-ubyvanie-funkcii',
    'promezhutki-monotonnosti',
    'ekstremumy-i-kriticheskie-tochki',
    '4-primenenie-proizvodnoj-k-issledovaniyu-funkcij',
]


def set_covers(apps, schema_editor):
    Lecture = apps.get_model('education', 'Lecture')
    for slug in COVERS:
        Lecture.objects.filter(slug=slug).update(image_url=f'/images/covers/{slug}.svg')


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0004_test_series_variant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lecture',
            name='image_url',
            field=models.CharField(default='/images/covers/default.svg', max_length=500, verbose_name='Путь к превью-картинке'),
        ),
        migrations.RunPython(set_covers, migrations.RunPython.noop),
    ]
