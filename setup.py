from setuptools import setup
import os.path

version = '1.4dev'

long_description = '\n\n'.join([
    open('README.txt').read(),
    open(os.path.join('lizard_ui', 'USAGE.txt')).read(),
    open('TODO.txt').read(),
    open('CREDITS.txt').read(),
    open('CHANGES.txt').read(),
    ])

install_requires = [
    'Django',
    'django-staticfiles',
    'django_compressor',  # Yes, underscore.
    'BeautifulSoup',
    ],

tests_require = [
    ]

setup(name='lizard-ui',
      version=version,
      description="Basic user interface for lizard websites",
      long_description=long_description,
      # Get strings from http://www.python.org/pypi?%3Aaction=list_classifiers
      classifiers=['Programming Language :: Python',
                   'Framework :: Django',
                   ],
      keywords=[],
      author='Reinout van Rees',
      author_email='reinout.vanrees@nelen-schuurmans.nl',
      url='http://www.nelen-schuurmans.nl/lizard/',
      license='GPL',
      packages=['lizard_ui'],
      include_package_data=True,
      zip_safe=False,
      install_requires=install_requires,
      tests_require=tests_require,
      extras_require = {'test': tests_require},
      entry_points={
          'console_scripts': [
          ]},
      )
