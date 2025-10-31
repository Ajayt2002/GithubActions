docker volume create course_app_backend_volume
docker network create course_app_backend_network
docker run --name postgres -v course_app_backend_volume:/var/lib/postgresql/data --network course_app_backend_network -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres 
docker build -t ajayt8374/course_app_backend .
docker run --network course_app_backend_network -p 3000:3000 -e DATABASE_URL="postgresql://postgres:mysecretpassword@postgres:5432/postgres" ajayt8374/course_app_backend

------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Important Note on Environment Variables
If your .env file is in your .dockerignore file, it won't be copied into the Docker image. If your application relies on it, this can cause issues.
To handle environment variables securely:
Pass them explicitly: Use the -e flag when running the container, as shown in Step 4. This is the recommended and most secure approach.
Remove .env from .dockerignore: This will include the file in the image, but it is less secure.
Use Docker Compose or Docker secrets: These provide more flexible and secure methods for managing environment variables in a production environment.