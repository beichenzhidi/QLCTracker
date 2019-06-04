import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { NodeService } from './node.service';

import { httpProvider } from 'qlc.js/provider/HTTP';
import Client from 'qlc.js/client';
import { methods } from 'qlc.js/common';
import { timer } from 'rxjs';

import  uuid from 'uuid/v4';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	rpcUrl = environment.rpcUrl;
	alive = true;
	connectTimer = null;
	
	private HTTP_RPC = new httpProvider(this.rpcUrl);
	c = new Client(this.HTTP_RPC, () => {});
	
	qlcTokenHash = 'a7e8fa30c063e96a489a47bc43909505bd86735da4a109dca28be936118a8582';

	constructor(private http: HttpClient, private node: NodeService) {
		//this.connectInterval.pipe(takeUntil(() => this.node.status)).subscribe()
		this.connect();
	}

	async connect() {
		const source = timer(1000);
		this.connectTimer = source.subscribe(async val => {
			
			const returns = await this.c.buildinLedger.blocksCount();

			if (returns.result) {
				if ( returns.result.count < 5) {
					this.node.setSynchronizing();
					this.connect();
				} else {
					this.node.setSynchronized();
				}
				this.node.setOnline();
			} else if (returns.error) {
				console.log(returns.error);
				this.connect();
			} else {
				console.log('error connecting');
				this.connect();
			}
		});
	}

	async reconnect(error = 'error') {
		console.log('reconnect ' + error);
		this.node.setOffline('ERROR - connection problem. Reconnecting.');
		this.connect();
	}

	async accountPublicKey(account: string): Promise<{ result: string; error?: string }> {
		try {
			return await this.c.request(methods.account.accountPublicKey, account);
		} catch (err) {
			return err;
		}
	}

	async accounts(count:Number = 0, offset:Number = 0): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.accounts(count,offset);
		if (!result.result && !result.error) 
			this.reconnect();
		return result;
	}
	
	async accountsCount(): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request( methods.ledger.accountsCount );
		} catch (err) {
			return err;
		}
	}

	async accountsBalances(accounts: string[]): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountsBalances, accounts);
		} catch (err) {
			return err;
		}
	}

	async accountsFrontiers(accounts: string[]): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountsFrontiers, accounts);
		} catch (err) {
			return err;
		}
	}

	async accountsPending(accounts: string[], count: number = 50): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.accountsPending(accounts,count);
		if (!result.result && !result.error) 
			this.reconnect('accountsPending');
		return result;
	}

	async delegatorsCount(account: string): Promise<{ count: string }> {
		try {
			return await this.c.request(methods.ledger.delegatorsCount, account);
		} catch (err) {
			return err;
		}
	}

	async onlineRepresentatives(): Promise<{ result: any }> {
		try {
			return await this.c.request(methods.net.onlineRepresentatives);
		} catch (err) {
			return err;
		}
	}

	async representatives(order = true): Promise<{ result: any }> {
		try {
			return await this.c.request(methods.ledger.representatives, order);
		} catch (err) {
			return err;
		}
	}

	async accountVotingWeight(account): Promise<{ result: any }> {
		try {
			return await this.c.request(methods.ledger.accountVotingWeight, account);
		} catch (err) {
			return err;
		}
	}

	async blocksInfo(blocks): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.blocksInfo, blocks);
		} catch (err) {
			return err;
		}
	}

	async blockHash(block): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.blockHash, block);
		} catch (err) {
			return err;
		}
	}

	async process(block): Promise<{ result: string; error?: string }> {
		try {
			return await this.c.request(methods.ledger.process, block);
		} catch (err) {
			return err;
		}
	}

	async accountBlocksCount(account): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.accountBlocksCount(account);
		if (typeof(result.result) != 'number' && !result.error) 
			this.reconnect('accountBlocksCount');
		return result;
	}

	

	async accountHistory(account, count = 25, offset = 0): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountHistoryTopn, account, count, offset);
		} catch (err) {
			return err;
		}
	}

	async accountInfo(account): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountInfo, account);
		} catch (err) {
			return err;
		}
	}

	async validateAccountNumber(account): Promise<{ result: true | false }> {
		try {
			return await this.c.request(methods.account.accountValidate, account);
		} catch (err) {
			return err;
		}
	}

	async tokens(): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.tokens);
		} catch (err) {
			return err;
		}
	}

	async blocks(count:Number = 0, offset:Number = 0): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.blocks(count,offset);
		if (!result.result && !result.error) 
			this.reconnect('blocks');

		return result;
	}
	
	async blocksCount(): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request( methods.ledger.blocksCount );
		} catch (err) {
			return err;
		}
	}
	
	async accountForPublicKey(account: string): Promise<{ result: any; error?: any }> {
		try {
			return await this.c.request( methods.account.accountForPublicKey, account );
		} catch (err) {
			return err;
		}
	}
	
	async blockAccount(account): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request( methods.ledger.blockAccount, account );
		} catch (err) {
			return err;
		}
	}

	async tokenInfoByName(tokenName): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.tokenInfoByName(tokenName);
		if (!result.result && !result.error) 
			this.reconnect('tokenInfoByName');
		return result;
	}
	
	async tokenByHash(tokenHash): Promise<any> {
		const tokens = await this.tokens();
		if (!tokens.error) {
			const tokenResult = tokens.result;
			return tokenResult.filter(token => {
				if (token.tokenId === tokenHash) {
					return token;
				}
			});
		}
		
		return null;
	}
	
	//TODO: remove token hash
	async accountInfoByToken(account, tokenHash = this.qlcTokenHash): Promise<any> {
		const am = await this.accountInfo(account);
		/*if (am.error) {
			return null;
		}*/
		const tokens = am.result.tokens;
		
		return Array.isArray(tokens) ? tokens.filter(tokenMeta => tokenMeta.type === tokenHash)[0] : null;
	}


	// sms
	async phoneBlocks(phoneNumber:string): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.phoneBlocks(phoneNumber);
		if (!result.result && !result.error) 
			this.reconnect('phoneBlocks');

		return result;
	}

	// rewards 

	private async request(action, data): Promise<any> {
		data.jsonrpc = '2.0';
		data.method = action;
		data.id = uuid();

		return await this.http
			.post(this.rpcUrl, data)
			.toPromise()
			.then(res => {
				return res;
			})
			.catch(err => {
				if (err.status === 500 || err.status === 0) {
				}
				throw err;
			});
	}
	

	async getTotalRewards(txid: string): Promise<{ result: any; error?: string }> {
		return await this.request('rewards_getTotalRewards', { params: [txid] });
	}

	async getReceiveRewardBlock(txid: string): Promise<{ result: any; error?: string }> {
		return await this.request('rewards_getReceiveRewardBlock', { params: [txid] });
	}

	async getConfidantRewardsDetail(account: string): Promise<{ result: any; error?: string }> {
		return await this.request('rewards_getConfidantRewordsDetail', { params: [account] });
	}

	async getConfidantRewards(account: string): Promise<{ result: any; error?: string }> {
		return await this.request('rewards_getConfidantRewards', { params: [account] });
	}
	
	async getTotalPledgeAmount(): Promise<{ result: any; error?: string }> {
		return await this.request('pledge_getTotalPledgeAmount', { params: [] });
	}

	
	async messageHash(message:string): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.messageHash(message);
		if (!result.result && !result.error) 
			this.reconnect('messageHash');

		return result;
	}

	async messageBlocks(messageHash:string): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.messageBlocks(messageHash);
		if (!result.result && !result.error) 
			this.reconnect('messageBlocks');

		return result;
	}
}
