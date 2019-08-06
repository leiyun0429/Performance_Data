cd /var/www/html/PDP
echo $(date) >> crontab.log
cd PDP
cd Performance
python3.4 manage.py migrate
cd ../..
port=`ps -ef|grep uwsgi|awk '{print $2}'|sed -n '2p'`
kill -9 $port
port=`ps -ef|grep uwsgiar|grep django.ini|awk '{print $2}'|sed -n '1p'`
kill -9 $port
uwsgi django.ini
