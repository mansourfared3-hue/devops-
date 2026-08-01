# Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name = "backend-deployment"
    labels = {
      app = "educommunity-backend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "educommunity-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "educommunity-backend"
        }
      }

      spec {
        image_pull_secrets {
          name = "regcred"
        }

        container {
          name  = "backend"
          image = "faredmansour20/backend-app:v1"

          port {
            container_port = 5000
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.app_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.app_secret.metadata[0].name
            }
          }
        }
      }
    }
  }
}

# Backend Service
resource "kubernetes_service" "backend_service" {
  metadata {
    name = "backend-service"
  }

  spec {
    selector = {
      app = "educommunity-backend"
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}