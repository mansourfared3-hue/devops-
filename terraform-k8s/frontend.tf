# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name = "frontend-deployment"
    labels = {
      app = "educommunity-frontend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "educommunity-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "educommunity-frontend"
        }
      }

      spec {
        image_pull_secrets {
          name = "regcred"
        }

        container {
          name  = "frontend"
          image = "faredmansour20/frontend-app:v1"

          port {
            container_port = 80
          }
        }
      }
    }
  }
}

# Frontend Service (Exposed to Browser)
resource "kubernetes_service" "frontend_service" {
  metadata {
    name = "frontend-service"
  }

  spec {
    selector = {
      app = "educommunity-frontend"
    }

    port {
      port        = 80
      target_port = 80
      node_port   = 30080
    }

    type = "NodePort"
  }
}