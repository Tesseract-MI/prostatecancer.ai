FROM python:3.6

COPY . ./models

RUN pip install -r ./models/requirements.txt

EXPOSE 5000

CMD ["python3", "./models/pcad.py"]
