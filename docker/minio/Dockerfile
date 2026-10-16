FROM golang:1.24 AS source

# Official MinIO release RELEASE.2025-04-22T22-12-26Z, pinned to its commit.
# The upstream prebuilt image is no longer available from the configured registry.
ADD https://api.github.com/repos/minio/minio/tarball/0d7408fc9969caf07de6a8c3a84f9fbb10a6739e /tmp/source.tar.gz
RUN mkdir /src && tar -xzf /tmp/source.tar.gz -C /src --strip-components=1

FROM source AS builder
WORKDIR /src
RUN CGO_ENABLED=0 go build -trimpath -o /minio .

FROM alpine:3.22
RUN apk add --no-cache ca-certificates curl
COPY --from=builder /minio /usr/local/bin/minio
COPY --from=source /src/LICENSE /usr/share/licenses/minio/LICENSE
ENTRYPOINT ["minio"]
