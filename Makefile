RED=\033[0;31m
BLUE=\033[0;34m
NC=\033[0m

all:
	@if [ -f ".env" ]; then \
		docker compose up -d --build; \
    else \
        echo "${RED}Env file does not exist!\nPlease create a .env file that includes:${NC}"; \
		echo "\
${BLUE}DB_HOST${NC}=postgres \
\n${BLUE}DB_USERNAME${NC}= \
\n${BLUE}DB_PASSWORD${NC}= \
\n${BLUE}DB_DATABASE${NC}= \
\n${BLUE}BACK_PORT${NC}= \
\n${BLUE}FRONT_PORT${NC}= \
\n${BLUE}DB_PORT${NC}= \
\n${BLUE}DOMAIN${NC}= \
\n${BLUE}UID${NC}= \
\n${BLUE}SECRET${NC}= \
\n${BLUE}PROTOCOL${NC}= (\"http\" or \"https\")\
\n${BLUE}BACK_URL${NC}=\$${DOMAIN}:\$${BACK_PORT} \
\n${BLUE}FRONT_URL${NC}=\$${DOMAIN}:\$${FRONT_PORT} \
\n${BLUE}FT_API${NC}=\"https://api.intra.42.fr/oauth/authorize?client_id=\$${UID}&redirect_uri=\$${PROTOCOL}%3A%2F%2F\$${DOMAIN}%3A\$${FRONT_PORT}&response_type=code\" \
\n${BLUE}DATABASE_URL${NC}=\"postgresql://\$${DB_USERNAME}:\$${DB_PASSWORD}@\$${DB_HOST}:\$${DB_PORT}/\$${DB_DATABASE}\" \
\n${BLUE}REDIRECT_URI${NC}=\"\$${PROTOCOL}://\$${FRONT_URL}\"\n";\
    fi

down:
	docker compose down

re: fclean all

clean:
	docker compose down -v --remove-orphans

fclean: down
	docker system prune -af
	docker volume prune -af
	rm -rf NestJS/Avatars/* NestJS/node_modules NestJS/dist 
#   rm -rf NestJS/run
	rm -rf React/node_modules
#	sudo rm -rf $(USER_HOME)/data/*

.PHONY: all down re clean fclean
