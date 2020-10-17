FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/site.conf

ADD __sapper__/export /app/
