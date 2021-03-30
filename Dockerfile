FROM node
RUN apt-get update \
    && apt-get install -y \
    sudo \
    wget \
    libusb-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://dl4jz3rbrsfum.cloudfront.net/software/PPL-1.3.3-64bit.deb \
    &&  dpkg -i --force-all ./PPL-1.3.3-64bit.deb

COPY . .
RUN npm install

CMD node index.js

# sudo docker run -it --rm -v /dev/usb/hiddev1:/dev/usb/hiddev1 --privileged gabbersepp/cyber-power-ups-control
