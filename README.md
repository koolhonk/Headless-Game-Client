# What is this?

This is a headless game client for HighSpell. It manages an unlimited amount of accounts (6 per world per IP), proxies, and dynamically loads scripts. 

Scripts are stateless. They will examine PlayerState and emit an action via PlayerActions

# How To Use


## Install
requires node
```
npm install
npm run build
```
## configure
create config/ folder
add a file called userMapping.csv to config/ folder
create entry for each user
```
username,password,world,script,scriptParam1,...,scriptParamN
```
## run
```
node app.cjs
```

