# 1. MongoDB Deployment
resource "kubernetes_deployment" "mongodb" {
  metadata {
    name = "mongodb-deployment"
    labels = {
      app = "mongodb"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "mongodb"
      }
    }

    template {
      metadata {
        labels = {
          app = "mongodb"
        }
      }

      spec {
        container {
          name  = "mongodb"
          image = "mongo:latest"

          port {
            container_port = 27017
          }
        }
      }
    }
  }
}

# 2. MongoDB Service
resource "kubernetes_service" "mongodb_service" {
  metadata {
    name = "mongodb-service"
  }

  spec {
    selector = {
      app = "mongodb"
    }

    port {
      port        = 27017
      target_port = 27017
    }

    type = "ClusterIP"
  }
}