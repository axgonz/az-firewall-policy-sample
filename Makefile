.DEFAULT_GOAL := create

create:
	az deployment sub create \
		--name "firewall-policy" \
		--location "australiaeast" \
		--template-file "src/main.bicep"