import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading false', () => {
    expect(service.loading()).toBeFalse();
  });

  it('should set loading to true on show', () => {
    service.show();
    expect(service.loading()).toBeTrue();
  });

  it('should set loading to false on hide', () => {
    service.show();
    service.hide();
    expect(service.loading()).toBeFalse();
  });

  it('should toggle loading state', () => {
    service.show();
    expect(service.loading()).toBeTrue();
    service.hide();
    expect(service.loading()).toBeFalse();
    service.show();
    expect(service.loading()).toBeTrue();
  });

  it('should return readonly signal', () => {
    expect(typeof service.loading).toBe('function');
  });
});
