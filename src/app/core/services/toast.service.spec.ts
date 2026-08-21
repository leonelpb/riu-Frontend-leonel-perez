import { fakeAsync, tick, TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should add a success toast', () => {
      service.success('Operation completed');

      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].type).toBe('success');
      expect(service.toasts()[0].message).toBe('Operation completed');
    });

    it('should auto-remove toast after 3 seconds', fakeAsync(() => {
      service.success('Test');
      expect(service.toasts().length).toBe(1);

      tick(3000);
      expect(service.toasts().length).toBe(0);
    }));
  });

  describe('error', () => {
    it('should add an error toast', () => {
      service.error('Something failed');

      expect(service.toasts()[0].type).toBe('error');
      expect(service.toasts()[0].message).toBe('Something failed');
    });

    it('should auto-remove error toast after 5 seconds', fakeAsync(() => {
      service.error('Error');
      expect(service.toasts().length).toBe(1);

      tick(5000);
      expect(service.toasts().length).toBe(0);
    }));
  });

  describe('info', () => {
    it('should add an info toast', () => {
      service.info('Information');

      expect(service.toasts()[0].type).toBe('info');
    });

    it('should auto-remove info toast after 3 seconds', fakeAsync(() => {
      service.info('Info');
      tick(3000);
      expect(service.toasts().length).toBe(0);
    }));
  });

  describe('show', () => {
    it('should add toast with custom duration', fakeAsync(() => {
      service.show('Quick toast', 'success', 1000);
      expect(service.toasts().length).toBe(1);

      tick(1000);
      expect(service.toasts().length).toBe(0);
    }));

    it('should support multiple toasts', () => {
      service.success('First');
      service.error('Second');
      service.info('Third');

      expect(service.toasts().length).toBe(3);
    });

    it('should auto-increment ids', () => {
      service.success('First');
      service.success('Second');

      expect(service.toasts()[0].id).not.toBe(service.toasts()[1].id);
    });
  });
});
