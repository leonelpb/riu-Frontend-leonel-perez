import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading false', () => {
    expect(service.loading()).toBeFalse();
  });

  it('should set loading to true on first increment', () => {
    service.increment();
    expect(service.loading()).toBeTrue();
  });

  it('should set loading to false when all requests complete', () => {
    service.increment();
    service.increment();
    service.decrement();
    expect(service.loading()).toBeTrue();
    service.decrement();
    expect(service.loading()).toBeFalse();
  });

  it('should track concurrent requests correctly', () => {
    service.increment();
    service.increment();
    service.increment();
    expect(service.loading()).toBeTrue();

    service.decrement();
    expect(service.loading()).toBeTrue();

    service.decrement();
    expect(service.loading()).toBeTrue();

    service.decrement();
    expect(service.loading()).toBeFalse();
  });

  it('should not go below zero on extra decrements', () => {
    service.increment();
    service.decrement();
    service.decrement();
    expect(service.loading()).toBeFalse();
  });

  it('should return readonly signal', () => {
    expect(typeof service.loading).toBe('function');
  });
});
