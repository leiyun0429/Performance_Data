#!/usr/bin/env python
import os
import sys
from libary import configuration

global_varable = {
    'query_key_to_database_key':{
        'release': 'release',
        'kernel': 'hard_config',
        'os': 'soft_config',
        'cpu': 'hard_config'
    }

}


if __name__ == "__main__":
    if sys.hexversion < 0x3000000:
        os.system('python3.4 ' + ' '.join(sys.argv))
        sys.exit(0)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Performance.settings")

    configuration.filter_condition_key = configuration.get_envir()
    print(configuration.filter_condition_key)

    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        # The above import may fail for some other reason. Ensure that the
        # issue is really that Django is missing to avoid masking other
        # exceptions on Python 2.
        try:
            import django
        except ImportError:
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            )
        raise
    #sys.argv[2] = '0.0.0.0:8008'
    execute_from_command_line(sys.argv)
