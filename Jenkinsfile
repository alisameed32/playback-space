@Library('Shared') _
pipeline {
    agent {label 'alisa'}
    
    environment{
        SONAR_HOME = tool "Sonar"
    }
    
    parameters {
        string(name: 'CLIENT_DOCKER_TAG', defaultValue: '', description: 'Setting docker image for latest push')
        string(name: 'BACKEND_DOCKER_TAG', defaultValue: '', description: 'Setting docker image for latest push')
    }
    
    stages {
        stage("Validate Parameters") {
            steps {
                script {
                    if (params.CLIENT_DOCKER_TAG == '' || params.BACKEND_DOCKER_TAG == '') {
                        error("CLIENT_DOCKER_TAG and BACKEND_DOCKER_TAG must be provided.")
                    }
                }
            }
        }
        stage("Workspace cleanup"){
            steps{
                script{
                    cleanWs()
                }
            }
        }
        
        stage('Git: Code Checkout') {
            steps {
                script{
                    code_checkout("https://github.com/alisameed32/playback-space.git","devops")
                }
            }
        }
        
        stage("Trivy: Filesystem scan"){
            steps{
                script{
                    trivy_scan()
                }
            }
        }

       stage("OWASP: Dependency check"){
            steps{
                script{
                    // Fetch the API Key using the ID you created earlier
                    withCredentials([string(credentialsId: 'NVD_API_KEY', variable: 'MY_NVD_KEY')]) {
                        // Pass the key to your shared library function
                        owasp_dependency(MY_NVD_KEY)
                    }
                }
            }
        }
        
        stage("SonarQube: Code Analysis"){
            steps{
                script{
                    sonarqube_analysis("Sonar","playback-space","playback-space")
                }
            }
        }
        
        stage("SonarQube: Code Quality Gates"){
            steps{
                script{
                    sonarqube_code_quality()
                }
            }
        }
        
        stage("Docker: Build Images"){
            steps{
                script{
                        dir('backend'){
                            docker_build("playback-space-backend-beta","${params.BACKEND_DOCKER_TAG}","alisameed")
                        }
                    
                        dir('client'){
                            docker_build("playback-space-client-beta","${params.CLIENT_DOCKER_TAG}","alisameed")
                        }
                }
            }
        }
        
        stage("Docker: Push to DockerHub"){
            steps{
                script{
                    docker_push("playback-space-backend-beta","${params.BACKEND_DOCKER_TAG}","alisameed") 
                    docker_push("playback-space-client-beta","${params.CLIENT_DOCKER_TAG}","alisameed")
                }
            }
        }
    }
    post{
        success{
            archiveArtifacts artifacts: '*.xml', followSymlinks: false
            build job: "playback-space-CD", parameters: [
                string(name: 'CLIENT_DOCKER_TAG', value: "${params.CLIENT_DOCKER_TAG}"),
                string(name: 'BACKEND_DOCKER_TAG', value: "${params.BACKEND_DOCKER_TAG}")
            ]
        }
    }
}