from django import template
register = template.Library()


@register.filter
def custimed_replace(arg, arg2):
    return arg.replace('_', arg2)


@register.filter
def custimed_replace_point(arg, arg2):
    return arg.replace('.', arg2)
