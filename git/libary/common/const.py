import sys


class _const:
    class ConstError(TypeError) : pass

    def __setattr__(self, key, value):
        if key in self.__dict__:
            raise self.ConstError
        self.__dict__[key] = value


sys.modules[__name__] = _const()