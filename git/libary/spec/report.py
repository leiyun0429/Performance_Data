import re
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm
import jinja2
from jinja2.utils import Markup
import subprocess
from docx import Document
import lxml


def export_report_docx(data, report_tpl_path, generate_report_word):
    tpl = DocxTemplate(report_tpl_path)

    context = {"empty": "N/A"}
    for key in data.keys():
        if key not in context:
            if key.lower() == "version":
                context[key] = data[key]
            elif key.lower() == "testname":
                context[key] = data[key]
            else:
                context[key] = {}
                if len(data[key]) == 0:
                    context[key]["flag"] = False
                else:
                    context[key]["flag"] = True
                    context[key]["image"] = []
                    for element in data[key]:
                        context[key]["image"].append(InlineImage(tpl, element, width=Mm(159.0)))

    jinja_env = jinja2.Environment(autoescape=True)
    tpl.render(context, jinja_env)
    tpl.save(generate_report_word)


def export_report_pdf(data, save_report_path, generate_report_word):
    cmd = 'libreoffice --convert-to pdf --outdir'.split() + [save_report_path] + [generate_report_word]

    # p = subprocess.Popen(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    # p.wait(timeout=10)
    # stdout, stderr = p.communicate()
    # if stderr:
    #     raise subprocess.SubprocessError(stderr)

    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    try:
        outs, errs = proc.communicate(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()
        outs, errs = proc.communicate()
        raise errs


def set_updatefields_true(docx_path):
    """
    Opens the docx and adds <w:updateFields w:val="true"/> to
    (docx_path)/word/setting.xml to enforce update of TOC (and
    other fields marked as dirty) on first open.
    Saves the file afterwards.

    Arguments:
        docx_path:  Absolute path to docx
    Returns:
        Nothing
    """

    namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    doc = Document(docx_path)

    element_updatefields = lxml.etree.SubElement(
        doc.settings.element, namespace + "updateFields"
    )
    element_updatefields.set(namespace + "val", "true")
    doc.save(docx_path)


def export_report(data, report_type):
    reports = {}
    save_report_path = 'static/file/download/'

    if report_type.lower() == "summary":
        report_tpl_path = 'static/file/templates/Standard_Benchmark_Report_Template.docx'
        generate_report_word = save_report_path + '%s_Standard_Benchmark_Report.docx' % (data['version'].upper())
    elif report_type.lower() == "standard":
        report_tpl_path = 'static/file/templates/Application_Benchmark_Report_Template.docx'
        generate_report_word = save_report_path + '%s_Benchmark_Report.docx' % (data['testname'])
    else:
        pass

    export_report_docx(data, report_tpl_path, generate_report_word)
    reports["word"] = generate_report_word

    # set_updatefields_true(generate_report_word)

    try:
        export_report_pdf(data, save_report_path, generate_report_word)
    except Exception as err:
        raise err
    else:
        reports["pdf"] = re.sub('docx$', 'pdf', generate_report_word)

    return reports


if __name__ == "__main__":
    # data = {"summary":["soc.PNG", "hardware.PNG", "soc.PNG", "hardware.PNG", "software.PNG"], "chart":[], "hardware": ["hardware.PNG", "hardware.PNG", "software.PNG"], "soc": [], "software": ["software.PNG"], "tune": ["tune.PNG", "hardware.PNG", "software.PNG"], "testname": "SPECJBB", "version": "HSRPV1.1"}
    # export_report(data, "standard")

    data = {"summary": ["summary.PNG", "soc.PNG"], "hardware": ["hardware.PNG"], "soc": ["soc.PNG"], "software": [],
            "tune": ["tune.PNG"], "version": "HSRPV1.5"}
    print(export_report(data, "summary"))