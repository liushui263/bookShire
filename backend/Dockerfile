FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

COPY entrypoint.sh .
COPY wait_for_db.py .

CMD ["bash", "entrypoint.sh"]

# ENTRYPOINT ["/entrypoint.sh"]