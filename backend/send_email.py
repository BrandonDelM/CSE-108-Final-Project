import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(sender, password, recipients, subject, body_text, body_html):
    msg = MIMEMultipart('alternative')
    msg['From']    = sender
    msg['To']      = ", ".join(recipients)
    msg['Subject'] = subject
    msg.attach(MIMEText(body_text, 'plain'))
    msg.attach(MIMEText(body_html, 'html'))

    if 'gmail' in sender:
        smtp_server = 'smtp.gmail.com'
        port = 465
    elif 'outlook' in sender or 'hotmail' in sender or 'live' in sender:
        smtp_server = 'smtp.office365.com'
        port = 587
    else:
        smtp_server = 'smtp.gmail.com'
        port = 465

    if port == 465:
        with smtplib.SMTP_SSL(smtp_server, port) as server:
            server.login(sender, password)
            server.sendmail(sender, recipients, msg.as_string())
    else:
        with smtplib.SMTP(smtp_server, port) as server:
            server.starttls()
            server.login(sender, password)