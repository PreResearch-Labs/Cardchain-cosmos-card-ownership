FROM ignitehq/cli:0.23.0

USER root
RUN apt-get -y -qq update && \
	apt-get install -y -qq curl wget unzip screen && \
	apt-get clean
#
# install jq to parse json within bash scripts
RUN curl -o /usr/local/bin/jq http://stedolan.github.io/jq/download/linux64/jq && \
  chmod +x /usr/local/bin/jq




USER tendermint

RUN export GOPATH=$HOME/go
RUN wget https://github.com/DecentralCardGame/go-faucet/archive/master.zip && \
	unzip master.zip -d . && cd go-faucet-master && go build

EXPOSE 1317
EXPOSE 26657
EXPOSE 26658
EXPOSE 9090
EXPOSE 4500

WORKDIR .
COPY --chown=tendermint:tendermint . .

RUN chmod +x ./docker-run.sh


RUN ignite chain build
RUN ignite chain init --home .Cardchain

#RUN python3 ./scripts/migrate_with_data.py ./blockchain-data/exported_genesis.json ~/.Cardchain/config/genesis.json

ENTRYPOINT ./docker-run.sh
