import { TestBed, inject } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';

describe('a profile component', () => {
	let component: ProfileComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ProfileComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ProfileComponent], (ProfileComponent) => {
		component = ProfileComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});