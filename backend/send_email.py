# import smtplib
# import os
# from dotenv import load_dotenv
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart

# load_dotenv()
# EMAIL = os.getenv('EMAIL')
# EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

# def send_email(sender: str = None, reciever: str = None, password: str = None, subject: str = None, body: str = None):
#     msg = MIMEMultipart()
#     msg['From'] = sender
#     msg['To'] = reciever
#     msg['Subject'] = subject
#     msg.attach(MIMEText(body, 'plain'))
#     server = smtplib.SMTP('smtp.gmail.com', 587)
#     try:
#         server.starttls()
#         server.login(sender, EMAIL_PASSWORD)
#         server.sendmail(sender, reciever, msg.as_string())
#     except smtplib.SMTPException as e:
#         print(f"Error: {e}")
#     finally:
#         server.quit()
#     return

# send_email(
#     sender=EMAIL,
#     reciever="brandon.delmundo@gmail.com",
#     password=EMAIL_PASSWORD,
#     subject="Hello",
#     body="This is a test email sent from Python."
# )


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
        smtp_server = 'smtp.gmail.com'  # default fallback
        port = 465

    if port == 465:
        with smtplib.SMTP_SSL(smtp_server, port) as server:
            server.login(sender, password)
            server.sendmail(sender, recipients, msg.as_string())
    else:
        with smtplib.SMTP(smtp_server, port) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, recipients, msg.as_string())