docker-build:
	docker build -t leandrorondon/udacity-fullstack-aws .
 
docker-run-c2-basic:
	docker run -it --rm -p 8082:8082 -v $(shell pwd)/course-02/exercises/udacity-c2-basic-server:/usr/src/app leandrorondon/udacity-fullstack-aws /bin/sh