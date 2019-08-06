import logging
from Performance import settings


class PDPLog:
    def __init__(self):
        self.logger_error = logging.getLogger('Error')
        self.logger_info = logging.getLogger('Info')
        self.logger_warning = logging.getLogger('Warning')
        self.init()

    def init(self):
        self.logger_error.setLevel(logging.ERROR)
        self.logger_info.setLevel(logging.INFO)
        self.logger_warning.setLevel(logging.WARNING)

        path_error = settings.BASE_DIR + '/log/error/error.log'
        handler_error = logging.FileHandler(filename=path_error)
        handler_error.setLevel(logging.ERROR)

        path_access = settings.BASE_DIR + '/log/access/access.log'
        handler_access = logging.FileHandler(filename=path_access)
        handler_access.setLevel(logging.INFO)

        path_waring = settings.BASE_DIR + '/log/warning/warning.log'
        handler_waring = logging.FileHandler(filename=path_waring)
        handler_waring.setLevel(logging.WARNING)

        formatter = logging.Formatter('%(name)s-%(levelname)s %(asctime)s: %(pathname)s->%(module)s.%(funcName)s'
                                      ' line:%(lineno)d %(message)s')

        handler_access.setFormatter(formatter)
        handler_error.setFormatter(formatter)
        handler_waring.setFormatter(formatter)

        self.logger_error.addHandler(handler_error)
        self.logger_info.addHandler(handler_access)
        self.logger_warning.addHandler(handler_waring)

    def error_log(self):
        return self.logger_error

    def access_log(self):
        return self.logger_info

    def warning_log(self):
        return self.logger_warning

