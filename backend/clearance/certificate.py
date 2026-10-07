"""
Builds the clearance certificate as a PDF.

This module only draws. It takes plain data (see build_certificate_pdf) and returns the PDF
as bytes, so it knows nothing about the database.
"""
from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# High-contrast color palette for maximum print readability
INK = colors.HexColor('#0f172a')       # Dark Slate for primary text
MUTED = colors.HexColor('#334155')     # Strong Dark Gray for labels & headers
RULE = colors.HexColor('#94a3b8')      # Visible Border Lines
BRAND = colors.HexColor('#0c4a6e')     # University Navy Blue
BAND = colors.HexColor('#f1f5f9')      # Header Table Accent Fill
GREEN = '#047857'                      # Bold Status Green

PAGE_MARGIN = 20 * mm
CONTENT_WIDTH = A4[0] - 2 * PAGE_MARGIN


def _styles():
    base = getSampleStyleSheet()['Normal']

    def make(name, **overrides):
        options = {'fontName': 'Helvetica', 'textColor': INK}
        options.update(overrides)
        return ParagraphStyle(name, parent=base, **options)

    return {
        'university': make(
            'university', fontName='Helvetica-Bold', fontSize=22, leading=26,
            alignment=TA_CENTER, textColor=BRAND,
        ),
        'title': make('title', fontName='Helvetica-Bold', fontSize=14, leading=18, alignment=TA_CENTER, textColor=MUTED),
        'body': make('body', fontSize=11, leading=17),
        'label': make('label', fontName='Helvetica-Bold', fontSize=9.5, leading=13, textColor=MUTED),
        'value': make('value', fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=INK),
        'head': make('head', fontName='Helvetica-Bold', fontSize=9.5, leading=13, textColor=BRAND),
        'cell': make('cell', fontSize=10, leading=14),
        'small': make('small', fontSize=9, leading=13, textColor=MUTED),
        'code': make('code', fontName='Courier-Bold', fontSize=14, leading=18, textColor=BRAND),
    }


def _text(value):
    """Escapes text for a Paragraph, which reads simple XML tags."""
    return escape('' if value is None else str(value))


def _pair(label, value, styles):
    return [Paragraph(_text(label), styles['label']), Paragraph(_text(value), styles['value'])]


def _qr(url, size=30 * mm):
    widget = QrCodeWidget(url)
    x0, y0, x1, y1 = widget.getBounds()
    drawing = Drawing(size, size, transform=[size / (x1 - x0), 0, 0, size / (y1 - y0), 0, 0])
    drawing.add(widget)
    return drawing


def _page_border(canvas, document):
    canvas.saveState()
    canvas.setStrokeColor(BRAND)
    canvas.setLineWidth(1.5)
    canvas.rect(10 * mm, 10 * mm, A4[0] - 20 * mm, A4[1] - 20 * mm)
    canvas.restoreState()


def build_certificate_pdf(data):
    """
    `data` is a dict of plain text:
      university_name, certificate_number, verification_code, verify_url,
      student: { name, student_id, faculty, department, section, year },
      clearance_type, started, completed, approved_by, approved_on, generated,
      offices: [ { name, status, officer, date }, ... ]
    Returns the PDF as bytes.
    """
    styles = _styles()
    student = data['student']
    story = []

    # Header
    story.append(Paragraph(_text(data['university_name']), styles['university']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('Clearance Certificate', styles['title']))
    story.append(HRFlowable(width='100%', thickness=1.5, color=BRAND, spaceBefore=8, spaceAfter=14))

    # Statement
    statement = (
        f"This is to certify that <b>{_text(student['name'])}</b> "
        f"(Student ID <b>{_text(student['student_id'])}</b>), "
        f"{_text(student['department'])}, {_text(student['faculty'])}, "
        f"Section {_text(student['section'])}, Year {_text(student['year'])}, "
        f"has completed the <b>{_text(data['clearance_type'])}</b> clearance and has been cleared "
        f"by each of the offices listed below."
    )
    story.append(Paragraph(statement, styles['body']))
    story.append(Spacer(1, 14))

    # Key details
    half = CONTENT_WIDTH / 2
    details = Table(
        [
            [_pair('Clearance type', data['clearance_type'], styles),
             _pair('Certificate number', data['certificate_number'], styles)],
            [_pair('Started', data['started'], styles),
             _pair('Completed', data['completed'], styles)],
            [_pair('Approved by', data['approved_by'], styles),
             _pair('Approval date', data['approved_on'], styles)],
        ],
        colWidths=[half, half],
    )
    details.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(details)
    story.append(Spacer(1, 6))

    # Offices
    rows = [[Paragraph(heading, styles['head']) for heading in ('OFFICE', 'STATUS', 'OFFICER', 'DATE')]]
    for office in data['offices']:
        rows.append([
            Paragraph(_text(office['name']), styles['cell']),
            Paragraph(f'<font color="{GREEN}"><b>{_text(office["status"])}</b></font>', styles['cell']),
            Paragraph(_text(office['officer']), styles['cell']),
            Paragraph(_text(office['date']), styles['cell']),
        ])

    offices_table = Table(
        rows,
        colWidths=[CONTENT_WIDTH * 0.32, CONTENT_WIDTH * 0.18, CONTENT_WIDTH * 0.30, CONTENT_WIDTH * 0.20],
        repeatRows=1,
    )
    offices_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BAND),
        ('LINEBELOW', (0, 0), (-1, 0), 1.0, BRAND),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, RULE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(offices_table)
    story.append(Spacer(1, 22))

    # Verification
    qr_size = 30 * mm
    verification = Table(
        [[
            _qr(data['verify_url'], qr_size),
            [
                Paragraph('VERIFY THIS CERTIFICATE', styles['head']),
                Spacer(1, 4),
                Paragraph(_text(data['verification_code']), styles['code']),
                Spacer(1, 4),
                Paragraph(
                    f"Scan the QR code, or visit<br/><b>{_text(data['verify_url'])}</b>",
                    styles['small'],
                ),
            ],
        ]],
        colWidths=[qr_size + 20, CONTENT_WIDTH - qr_size - 20],
    )
    verification.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1.0, RULE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(verification)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        f"Generated on {_text(data['generated'])}. This certificate is valid only if its verification "
        f"code matches the university's record.",
        styles['small'],
    ))

    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=PAGE_MARGIN,
        rightMargin=PAGE_MARGIN,
        topMargin=22 * mm,
        bottomMargin=20 * mm,
        title=f"Clearance certificate {data['certificate_number']}",
        author=data['university_name'],
        subject=f"Clearance for {student['name']}",
    )
    document.build(story, onFirstPage=_page_border, onLaterPages=_page_border)

    return buffer.getvalue()