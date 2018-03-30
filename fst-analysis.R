setwd("/Users/lily/Projects/ospC-freq-fst/")

## Compute Fst of alleles 
# pop1 vs pop3
tick <- read.table("tick-ind.tsv", header=T, sep = "\t")
pop1 <- tick[which(tick$pop == 'pop1'),2:21]
pop1.count <- apply(pop1, 2, sum)
n1 <- sum(pop1.count) 
h1 <- 1 - sum((pop1.count/n1)**2)
pop3 <- tick[which(tick$pop == 'pop3'),2:21]
pop3.count <- apply(pop3, 2, sum)
n3 <- sum(pop3.count) 
h3 <- 1 - sum((pop3.count/n3)**2)
h.13 <- 1 - sum(((pop1.count+pop3.count)/(n1+n3))**2)
fst.13 <- 1 - (n1 * h1 + n3 * h3)/(n1 + n3)/h.13 
# Test Fst by Bootstrap
pop13 <- tick[which(tick$pop == 'pop1'| tick$pop == 'pop3'),2:21]
fst.ran <- numeric(1000)
for (i in 1:1000) {
  index <- sample(94, 27)
  pop1.ran <- pop13[index,]
  pop3.ran <- pop13[-index,]
  pop1.ran.count <- apply(pop1.ran, 2, sum)
  n1.ran <- sum(pop1.ran.count)
  h1.ran <- 1 - sum((pop1.ran.count/n1.ran)**2)
  pop3.ran.count <- apply(pop3.ran, 2, sum)
  n3.ran <- sum(pop3.ran.count) 
  h3.ran <- 1 - sum((pop3.ran.count/n3.ran)**2)
  fst.ran[i] <- 1 - (n1.ran * h1.ran + n3.ran * h3.ran)/(n1.ran + n3.ran)/h.13 
}
hist(fst.ran, xlab= "Fst", breaks = 100, main = 'Histogram of Fst - pop1 vs pop3')
abline(v=fst.13,col=2)
Pvalue <- length(which(fst.ran >= fst.13))/1000

# pop1+pop3 vs pop2+pop4
pop13 <- tick[which(tick$pop == 'pop1'| tick$pop == 'pop3'),2:21]
pop13.count <- apply(pop13, 2, sum)
n13 <- sum(pop13.count) 
h13 <- 1 - sum((pop13.count/n13)**2)
pop24 <- tick[which(tick$pop == 'pop2'| tick$pop == 'pop4'),2:21]
pop24.count <- apply(pop24, 2, sum)
n24 <- sum(pop24.count) 
h24 <- 1 - sum((pop24.count/n24)**2)
h.13.24 <- 1 - sum(((pop13.count+pop24.count)/(n13+n24))**2)
fst.13.24 <- 1 - (n13 * h13 + n24 * h24)/(n13 + n24)/h.13.24 
# Test Fst by Bootstrap
fst.ran2 <- numeric(1000)
for (i in 1:1000) {
  index <- sample(119, 25)
  pop13.ran <- tick[-index,2:21]
  pop24.ran <- tick[index,2:21]
  pop13.ran.count <- apply(pop13.ran, 2, sum)
  n13.ran <- sum(pop13.ran.count)
  h13.ran <- 1 - sum((pop13.ran.count/n13.ran)**2)
  pop24.ran.count <- apply(pop24.ran, 2, sum)
  n24.ran <- sum(pop24.ran.count) 
  h24.ran <- 1 - sum((pop24.ran.count/n24.ran)**2)
  fst.ran2[i] <- 1 - (n13.ran * h13.ran + n24.ran * h24.ran)/(n13.ran + n24.ran)/h.13.24 
}
hist(fst.ran2, xlab= "Fst", breaks = 100, main = 'Histogram of Fst - pop1+pop3 vs pop2+pop4')
abline(v=fst.13.24,col=2)
Pvalue2 <- length(which(fst.ran2 >= fst.13.24))/1000

## Compute Fst using hierfstat package
tick.di <- read.table("tick-ind2.tsv", header=T, sep = "\t")
library(hierfstat)
library(adegenet)
# Fst and boostrap on 4 individual pops
tick.genind <- df2genind(tick.di[,2:21], ploidy=2, pop = tick.di[,27], 
  loc.names=colnames(tick.di)[2:21], ind.names=tick.di[,22], type="codom", sep="/")
mat.fst <- pairwise.fst(tick.genind)
allels <- tick[,c(2:21)]
allels <- cbind(pop = tick$pop, allels)
allels$pop <- gsub('pop','', allels$pop)
allels$pop <- as.numeric(allels$pop)
allels <- allels[order(allels$pop),]
test.ind <- boot.ppfst(allels,nboot=1000)
test.ind$ul
test.ind$ll
# Fst and boostrap on combined pops
# pop1+pop3 vs pop2+pop4
pop.com2 <- tick.di
pop.com2$pop <- gsub('pop3','pop1',pop.com2$pop)
pop.com2$pop <- gsub('pop4','pop2',pop.com2$pop)
pop.genind <- df2genind(pop.com2[,2:21], ploidy=2, pop = pop.com2[,27], 
   loc.names=colnames(pop.com2)[2:21], ind.names=pop.com2[,22], type="codom", sep="/")
pop.fst <- pairwise.fst(pop.genind)
pop.com <- tick.loci
pop.com[which(pop.com$pop == 3),1] <- 1
pop.com[which(pop.com$pop == 4),1] <- 2
pop.com <- pop.com[order(pop.com$pop),]
test.com <- boot.ppfst(pop.com,nboot=1000)
test.com$ul
test.com$ll

# Compute Fst by pegas package
library(pegas)
tick.loci2 <- tick.di[,c(2:21,27)]
colnames(tick.loci2)[21] <- 'population'
tick.loci2 <- tick.loci2[order(tick.loci2$population),]
Fst(tick.loci2)


