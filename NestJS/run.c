#include <unistd.h>
#include <stdlib.h>
int main(){system("prisma migrate dev -n prisma_init"); int pid = fork(); if(pid == 0){system("prisma studio"); exit(0);}else{system("npm run start:dev"); exit(1);}}
