Phase 1: The Foundation (Local MVP)

Goal: Get code running from a browser on your local machine.

    [ ] Setup Monolith: Init spring boot Java backend and React TypeScript Frontend

    [ ] Editor Integration: Create a web editor to write code

    [ ] Local Execution: Create a basic Java service that saves the user's code to a temporary .py file and runs it using the local python3 command, returning the result to the UI.

Phase 2: The "Multiplayer" Engine (Real-time)

Goal: Allow two tabs to see the same code at the same time.

    [ ] WebSocket Setup: Implement Spring Data-Redis and WebSockets to handle real-time messaging.

    [ ] CRDT Implementation: Integrate Yjs on the frontend to handle collaborative text editing (preventing cursor "jumping" and text overwrites).

    [ ] Presence Features: Add "User Presence" (e.g., "User A is typing...") so users know who they are collaborating with.

    [ ] Shared State: Sync the "Run Code" results so both users see the test case output simultaneously.

Phase 3: The "Judge" (Security & Sandbox)

Goal: Move code execution into a secure, isolated environment.

    [ ] Dockerization: Create a lightweight Python Docker image that contains pytest and a custom runner.py.

    [ ] Java Docker Client: Use the docker-java library to programmatically:

        Pull the image.

        Mount the user code.

        Set limits (e.g., --memory=128m, --cpus=0.5).

    [ ] Test Case Parser: Build a utility to parse the Python test cases from your local folders into a format the Docker container can iterate through.

    [ ] Timeout Logic: Implement a "Kill Switch" in Java to terminate any container running longer than 5 seconds.

Phase 4: Scaling to AWS (Deployment)

Goal: Make the project accessible via a URL.

    [ ] Database Setup: Migrate your local problem data to AWS RDS (PostgreSQL).

    [ ] Container Orchestration: Deploy the Java Backend to AWS ECS (Elastic Container Service).

    [ ] Frontend Hosting: Deploy the React app to AWS Amplify or S3/CloudFront.

    [ ] Networking: Set up an Application Load Balancer (ALB) to handle the WebSocket (sticky sessions) and HTTP traffic.

Phase 5: Polishing for the Resume

    [ ] Lobby System: Create a simple "Room Code" system (e.g., synapse.com/room/abc-123).

    [ ] Readme Documentation: Write a killer README with an architecture diagram, tech stack justifications, and a "Challenges Overcome" section.