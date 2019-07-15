import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HOST_NAME} from '../../environments/environment';
import {AuthInfo} from '../models/auth-info';
import {Batch} from '../models/batch';
import {Corporation} from '../models/corporation';
import {DoffingSilkCarRecordReportItem} from '../models/doffing-silk-car-record-report';
import {DyeingSampleSilkSubmitEvent, EventSource, ProductProcessSubmitEvent} from '../models/event-source';
import {ExceptionRecord} from '../models/exception-record';
import {FormConfig} from '../models/form-config';
import {Grade} from '../models/grade';
import {Line} from '../models/line';
import {LineMachine} from '../models/line-machine';
import {LineMachineProductPlan} from '../models/line-machine-product-plan';
import {MeasureReport} from '../models/measure-report';
import {Notification} from '../models/notification';
import {Operator} from '../models/operator';
import {OperatorGroup} from '../models/operator-group';
import {PackageClass} from '../models/package-class';
import {Permission} from '../models/permission';
import {Product} from '../models/product';
import {ProductPlanNotify} from '../models/product-plan-notify';
import {ProductProcess} from '../models/product-process';
import {SapT001l} from '../models/sapT001l';
import {SilkCar} from '../models/silk-car';
import {SilkCarRecord} from '../models/silk-car-record';
import {SilkCarRuntime} from '../models/silk-car-runtime';
import {SilkException} from '../models/silk-exception';
import {SilkNote} from '../models/silk-note';
import {StatisticsReport} from '../models/statistics-report';
import {SuggestOperator} from '../models/suggest-operator';
import {Workshop} from '../models/workshop';
import {WorkshopProductPlanReport} from '../models/workshop-product-plan-report';

const BASE_API_URL = `http://${HOST_NAME}:9998/api`;
const SHARE_API_URL = `http://${HOST_NAME}:9998/share`;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {
  }

  token(body: { loginId: string; loginPassword: string }): Observable<string> {
    return this.http.post(`http://${HOST_NAME}:9998/token`, body, {responseType: 'text'});
  }

  saveOperatorGroup(operatorGroup: OperatorGroup): Observable<OperatorGroup> {
    return operatorGroup.id ? this.updateOperatorGroup(operatorGroup) : this.createOperatorGroup(operatorGroup);
  }

  listOperatorGroup(params?: HttpParams): Observable<OperatorGroup[]> {
    return this.http.get<OperatorGroup[]>(`${BASE_API_URL}/operatorGroups`, {params});
  }

  listSuggestOperator(params?: HttpParams): Observable<SuggestOperator[]> {
    return this.http.get<SuggestOperator[]>(`${BASE_API_URL}/suggestOperators`, {params});
  }

  deletePermission(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/permissions/${id}`);
  }

  saveOperator(operator: Operator): Observable<Operator> {
    return operator.id ? this.updateOperator(operator) : this.importOperator(operator);
  }

  getOperator(id: string): Observable<Operator> {
    return this.http.get<Operator>(`${BASE_API_URL}/operators/${id}`);
  }

  listOperator(params?: HttpParams): Observable<{ count: number, first: number, pageSize: number, operators: Operator[] }> {
    return this.http.get<{ count: number, first: number, pageSize: number, operators: Operator[] }>(`${BASE_API_URL}/operators`, {params});
  }

  saveProductPlanNotify(productPlanNotify: ProductPlanNotify): Observable<ProductPlanNotify> {
    return productPlanNotify.id ? this.updateProductPlanNotify(productPlanNotify) : this.createProductPlanNotify(productPlanNotify);
  }

  getProductPlanNotify(id: string): Observable<ProductPlanNotify> {
    return this.http.get<ProductPlanNotify>(`${BASE_API_URL}/productPlanNotifies/${id}`);
  }

  getProductPlanNotify_exeInfo(id: string): Observable<{ productPlanNotify: ProductPlanNotify, lineMachineProductPlans: LineMachineProductPlan[] }> {
    return this.http.get<{ productPlanNotify: ProductPlanNotify, lineMachineProductPlans: LineMachineProductPlan[] }>(`${BASE_API_URL}/productPlanNotifies/${id}/exeInfo`);
  }

  exeProductPlanNotify(id: string, lineMachine: LineMachine): Observable<void> {
    return this.http.post<void>(`${BASE_API_URL}/productPlanNotifies/${id}/exe`, {lineMachine});
  }

  batchExeProductPlanNotify(id: string, lineMachines: LineMachine[]): Observable<void> {
    return this.http.post<void>(`${BASE_API_URL}/productPlanNotifies/${id}/batchExe`, {lineMachines});
  }

  finishProductPlanNotify(id: string): Observable<void> {
    return this.http.put<void>(`${BASE_API_URL}/productPlanNotifies/${id}/finish`, null);
  }

  unFinishProductPlanNotify(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE_API_URL}/productPlanNotifies/${id}/finish`);
  }

  deleteProductPlanNotify(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/productPlanNotifies/${id}`);
  }

  listProductPlanNotify(params?: HttpParams): Observable<{ count: number, first: number, pageSize: number, productPlanNotifies: ProductPlanNotify[] }> {
    return this.http.get<{ count: number, first: number, pageSize: number, productPlanNotifies: ProductPlanNotify[] }>(`${BASE_API_URL}/productPlanNotifies`, {params});
  }

  /*车间增删改查*/
  saveWorkshop(workshop: Workshop): Observable<Workshop> {
    return workshop.id ? this.updateWorkshop(workshop) : this.createWorkshop(workshop);
  }

  getWorkshop_Lines(id: string): Observable<Line[]> {
    return this.http.get<Line[]>(`${BASE_API_URL}/workshops/${id}/lines`);
  }

  listWorkshop(params?: HttpParams): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(`${BASE_API_URL}/workshops`, {params});
  }

  deleteWorkshop(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/workshops/${id}`);
  }

  listExceptionRecord(params?: HttpParams): Observable<ExceptionRecord[]> {
    return this.http.get<ExceptionRecord[]>(`${BASE_API_URL}/exceptionRecords`, {params});
  }

  handleExceptionRecord(id: string): Observable<void> {
    return this.http.put<void>(`${BASE_API_URL}/exceptionRecords/${id}/handle`, null);
  }

  /*产品增删改查*/
  saveProduct(product: Product): Observable<Product> {
    return product.id ? this.updateProduct(product) : this.createProduct(product);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${BASE_API_URL}/products/${id}`);
  }

  getProduct_ProductProcess(id: string): Observable<ProductProcess[]> {
    return this.http.get<ProductProcess[]>(`${BASE_API_URL}/products/${id}/productProcesses`);
  }

  listProduct(params?: HttpParams): Observable<Product[]> {
    return this.http.get<Product[]>(`${BASE_API_URL}/products`, {params});
  }

  /*生产工艺的增删改查*/
  saveProductProcess(productProcess: ProductProcess): Observable<ProductProcess> {
    return productProcess.id ? this.updateProductProcess(productProcess) : this.createProductProcess(productProcess);
  }

  listProductProcess(params?: HttpParams): Observable<ProductProcess> {
    return this.http.get<ProductProcess>(`${BASE_API_URL}/productProcesses`, {params});
  }

  /*生产工艺异常信息*/
  saveSilkException(silkException: SilkException): Observable<SilkException> {
    return silkException.id ? this.updateSilkException(silkException) : this.createSilkException(silkException);
  }

  listSilkException(params?: HttpParams): Observable<SilkException[]> {
    return this.http.get<SilkException[]>(`${BASE_API_URL}/silkExceptions`, {params});
  }

  saveSilkNote(silkNote: SilkNote): Observable<SilkNote> {
    return silkNote.id ? this.updateSilkNote(silkNote) : this.createSilkNote(silkNote);
  }

  listSilkNote(params?: HttpParams): Observable<SilkNote[]> {
    return this.http.get<SilkNote[]>(`${BASE_API_URL}/silkNotes`, {params});
  }

  /*线别*/
  saveLine(line: Line): Observable<Line> {
    return line.id ? this.updateLine(line) : this.createLine(line);
  }

  deleteLine(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/lines/${id}`);
  }

  listLine(params?: HttpParams): Observable<{ count: number, first: number, pageSize: number, lines: Line[] }> {
    return this.http.get<{ count: number, first: number, pageSize: number, lines: Line[] }>(`${BASE_API_URL}/lines`, {params});
  }

  getLine_LineMachines(id: string): Observable<LineMachine[]> {
    return this.http.get<LineMachine []>(`${BASE_API_URL}/lines/${id}/lineMachines`);
  }

  /*丝车*/
  saveSilkCar(silkCar: SilkCar): Observable<SilkCar> {
    return silkCar.id ? this.updateSilkCar(silkCar) : this.createSilkCar(silkCar);
  }

  batchSilkCars(silkCars: SilkCar[]): Observable<void> {
    return this.http.post<void>(`${BASE_API_URL}/batchSilkCars`, silkCars);
  }

  deleteSilkCar(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/silkCars/${id}`);
  }

  getSilkCar(id: string): Observable<SilkCar> {
    return this.http.get<SilkCar>(`${BASE_API_URL}/silkCars/${id}`);
  }

  getSilkCarByCode(code: string): Observable<SilkCar> {
    return this.http.get<SilkCar>(`${BASE_API_URL}/silkCarCodes/${code}`);
  }

  listSilkCar(params?: HttpParams): Observable<{ count: number, first: number, pageSize: number, silkCars: SilkCar[] }> {
    return this.http.get<{ count: number, first: number, pageSize: number, silkCars: SilkCar [] }>(`${BASE_API_URL}/silkCars`, {params});
  }

  querySilkCarRecord(params?: HttpParams): Observable<{ count: number, first: number, pageSize: number, silkCarRecords: SilkCarRecord[] }> {
    return this.http.get<{ count: number, first: number, pageSize: number, silkCarRecords: SilkCarRecord[] }>(`${BASE_API_URL}/silkCarRecords`, {params});
  }

  getSilkCarRecord_Events(id: string): Observable<EventSource[]> {
    return this.http.get<EventSource[]>(`${BASE_API_URL}/silkCarRecords/${id}/events`);
  }

  autoCompleteSilkCar(q: string): Observable<SilkCar[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<SilkCar[]>(`${BASE_API_URL}/autoComplete/silkCar`, {params});
  }

  autoCompleteFormConfig(q: string): Observable<FormConfig[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<FormConfig[]>(`${BASE_API_URL}/autoComplete/formConfig`, {params});
  }

  saveFormConfig(formConfig: FormConfig): Observable<FormConfig> {
    return formConfig.id ? this.updateFormConfig(formConfig) : this.createFormConfig(formConfig);
  }

  /*批号*/
  saveBatch(batch: Batch): Observable<Batch> {
    return batch.id ? this.updateBatch(batch) : this.createBatch(batch);
  }

  listBatch(params?: HttpParams): Observable<{ count: number, first: number, pageSize: number, batches: Batch [] }> {
    return this.http.get<{ count: number, first: number, pageSize: number, batches: Batch[] }>(`${BASE_API_URL}/batches`, {params});
  }

  deleteBatch(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/batches/${id}`);
  }

  /*公司*/
  listCorporation(params?: HttpParams): Observable<Corporation[]> {
    return this.http.get<Corporation[]>(`${BASE_API_URL}/corporations`, {params});
  }

  /*机台*/
  saveLineMachine(lineMachine: LineMachine): Observable<LineMachine> {
    return lineMachine.id ? this.updateLineMachine(lineMachine) : this.createLineMachine(lineMachine);
  }

  batchLineMachines(lineMachines: LineMachine[]): Observable<LineMachine[]> {
    return this.http.post<LineMachine[]>(`${BASE_API_URL}/batchLineMachines`, lineMachines);
  }

  getLineMachine_ProductPlan(id: string): Observable<LineMachineProductPlan> {
    return this.http.get<LineMachineProductPlan>(`${BASE_API_URL}/lineMachines/${id}/productPlan`);
  }

  listLineMachine(params?: HttpParams): Observable<LineMachine[]> {
    return this.http.get<LineMachine[]>(`${BASE_API_URL}/lineMachines`, {params});
  }

  deleteLineMachine(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/lineMachines/${id}`);
  }

  saveGrade(grade: Grade): Observable<Grade> {
    return grade.id ? this.updateGrade(grade) : this.createGrade(grade);
  }

  listGrade(params?: HttpParams): Observable<Grade []> {
    return this.http.get<Grade[]>(`${BASE_API_URL}/grades`, {params});
  }

  deleteGrade(id: string): Observable<any> {
    return this.http.delete(`${BASE_API_URL}/grades/${id}`);
  }

  listPackageClass(params?: HttpParams): Observable<PackageClass []> {
    return this.http.get<PackageClass[]>(`${BASE_API_URL}/packageClasses`, {params});
  }

  saveSapT001l(sapT001l: SapT001l): Observable<SapT001l> {
    return sapT001l.id ? this.updateSapT001l(sapT001l) : this.createSapT001l(sapT001l);
  }

  listSapT001l(params?: HttpParams): Observable<SapT001l []> {
    return this.http.get<SapT001l[]>(`${BASE_API_URL}/sapT001ls`, {params});
  }

  /*权限*/
  savePermission(permission: Permission): Observable<Permission> {
    return permission.id ? this.updatePermission(permission) : this.createPermission(permission);
  }

  listPermission(params?: HttpParams): Observable<Permission []> {
    return this.http.get<Permission[]>(`${BASE_API_URL}/permissions`, {params});
  }

  authInfo(): Observable<AuthInfo> {
    return this.http.get<AuthInfo>(`${BASE_API_URL}/auth`);
  }

  getSilkCarRuntimeByCode(code: string): Observable<SilkCarRuntime> {
    return this.http.get<SilkCarRuntime>(`${BASE_API_URL}/silkCarRuntimes/${code}`);
  }

  productProcessSubmitEvents(event: ProductProcessSubmitEvent): Observable<void> {
    return this.http.post<void>(`${BASE_API_URL}/ProductProcessSubmitEvents`, event);
  }

  dyeingSampleSubmitEvents(event: DyeingSampleSilkSubmitEvent): Observable<void> {
    return this.http.post<void>(`${BASE_API_URL}/DyeingSampleSubmitEvents`, event);
  }

  getSilkException(id: string): Observable<SilkException> {
    return this.http.get<SilkException>(`${BASE_API_URL}/silkExceptions/${id}`);
  }

  getSilkNote(id: string): Observable<SilkNote> {
    return this.http.get<SilkNote>(`${BASE_API_URL}/silkNotes/${id}`);
  }

  getProductProcess(id: string): Observable<ProductProcess> {
    return this.http.get<ProductProcess>(`${BASE_API_URL}/productProcesses/${id}`);
  }

  measureReport(params?: HttpParams): Observable<MeasureReport> {
    return this.http.get<MeasureReport>(`${BASE_API_URL}/reports/measureReport`, {params});
  }

  statisticsReport(params?: HttpParams): Observable<StatisticsReport> {
    return this.http.get<StatisticsReport>(`${BASE_API_URL}/reports/statisticsReport`, {params});
  }

  private updateProductPlanNotify(productPlanNotify: ProductPlanNotify): Observable<ProductPlanNotify> {
    return this.http.put<ProductPlanNotify>(`${BASE_API_URL}/productPlanNotifies/${productPlanNotify.id}`, productPlanNotify);
  }

  private createProductPlanNotify(productPlanNotify: ProductPlanNotify): Observable<ProductPlanNotify> {
    return this.http.post<ProductPlanNotify>(`${BASE_API_URL}/productPlanNotifies`, productPlanNotify);
  }

  private updateSilkException(silkException: SilkException): Observable<SilkException> {
    return this.http.put<SilkException>(`${BASE_API_URL}/silkExceptions/${silkException.id}`, silkException);
  }

  private createSilkException(silkException: SilkException): Observable<SilkException> {
    return this.http.post<SilkException>(`${BASE_API_URL}/silkExceptions`, silkException);
  }

  private updateSilkNote(silkNote: SilkNote): Observable<SilkNote> {
    return this.http.put<SilkNote>(`${BASE_API_URL}/silkNotes/${silkNote.id}`, silkNote);
  }

  private createSilkNote(silkNote: SilkNote): Observable<SilkNote> {
    return this.http.post<SilkNote>(`${BASE_API_URL}/silkNotes`, silkNote);
  }

  private updateLine(line: Line): Observable<Line> {
    return this.http.put<Line>(`${BASE_API_URL}/lines/${line.id}`, line);
  }

  private createLine(line: Line): Observable<Line> {
    return this.http.post<Line>(`${BASE_API_URL}/lines`, line);
  }

  private updateSilkCar(silkCar: SilkCar): Observable<SilkCar> {
    return this.http.put<SilkCar>(`${BASE_API_URL}/silkCars/${silkCar.id}`, silkCar);
  }

  private createSilkCar(silkCar: SilkCar): Observable<SilkCar> {
    return this.http.post<SilkCar>(`${BASE_API_URL}/silkCars`, silkCar);
  }

  private updateFormConfig(formConfig: FormConfig): Observable<FormConfig> {
    return this.http.put<FormConfig>(`${BASE_API_URL}/formConfigs/${formConfig.id}`, formConfig);
  }

  private createFormConfig(formConfig: FormConfig): Observable<FormConfig> {
    return this.http.post<FormConfig>(`${BASE_API_URL}/formConfigs`, formConfig);
  }

  private updateBatch(batch: Batch): Observable<Batch> {
    return this.http.put<Batch>(`${BASE_API_URL}/batches/${batch.id}`, batch);
  }

  private createBatch(batch: Batch): Observable<Batch> {
    return this.http.post<Batch>(`${BASE_API_URL}/batches`, batch);
  }

  private updateLineMachine(lineMachine: LineMachine): Observable<LineMachine> {
    return this.http.put<LineMachine>(`${BASE_API_URL}/lineMachines/${lineMachine.id}`, lineMachine);
  }

  private createLineMachine(lineMachine: LineMachine): Observable<LineMachine> {
    return this.http.post<LineMachine>(`${BASE_API_URL}/lineMachines`, lineMachine);
  }

  private updateGrade(grade: Grade): Observable<Grade> {
    return this.http.put<Grade>(`${BASE_API_URL}/grades/${grade.id}`, grade);
  }

  private createGrade(grade: Grade): Observable<Grade> {
    return this.http.post<Grade>(`${BASE_API_URL}/grades`, grade);
  }

  private updateOperator(operator: Operator): Observable<Operator> {
    return this.http.put<Operator>(`${BASE_API_URL}/operators/${operator.id}`, operator);
  }

  private importOperator(operator: Operator): Observable<Operator> {
    return this.http.post<Operator>(`${BASE_API_URL}/operators`, operator);
  }

  private updateOperatorGroup(operatorGroup: OperatorGroup): Observable<OperatorGroup> {
    return this.http.put<OperatorGroup>(`${BASE_API_URL}/operatorGroups/${operatorGroup.id}`, operatorGroup);
  }

  private createOperatorGroup(operatorGroup: OperatorGroup): Observable<OperatorGroup> {
    return this.http.post<OperatorGroup>(`${BASE_API_URL}/operatorGroups`, operatorGroup);
  }

  private updatePermission(permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${BASE_API_URL}/permissions/${permission.id}`, permission);
  }

  private createPermission(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(`${BASE_API_URL}/permissions`, permission);
  }

  private updateWorkshop(workshop: Workshop): Observable<Workshop> {
    return this.http.put<Workshop>(`${BASE_API_URL}/workshops/${workshop.id}`, workshop);
  }

  private createWorkshop(workshop: Workshop): Observable<Workshop> {
    return this.http.post<Workshop>(`${BASE_API_URL}/workshops`, workshop);
  }

  private updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${BASE_API_URL}/products`, product);
  }

  private createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${BASE_API_URL}/products`, product);
  }

  private updateProductProcess(productProcess: ProductProcess): Observable<ProductProcess> {
    return this.http.put<ProductProcess>(`${BASE_API_URL}/productProcesses/${productProcess.id}`, productProcess);
  }

  private createProductProcess(productProcess: ProductProcess): Observable<ProductProcess> {
    return this.http.post<ProductProcess>(`${BASE_API_URL}/productProcesses`, productProcess);
  }

  private createSapT001l(sapT001l: SapT001l): Observable<SapT001l> {
    return this.http.post<SapT001l>(`${BASE_API_URL}/sapT001ls`, sapT001l);
  }

  private updateSapT001l(sapT001l: SapT001l): Observable<SapT001l> {
    return this.http.put<SapT001l>(`${BASE_API_URL}/sapT001ls/${sapT001l.id}`, sapT001l);
  }

  doffingSilkCarRecordReport(params?: HttpParams): Observable<DoffingSilkCarRecordReportItem[]> {
    return this.http.get<DoffingSilkCarRecordReportItem[]>(`${BASE_API_URL}/reports/doffingSilkCarRecordReport`, {params});
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiShareService {
  constructor(private http: HttpClient) {
  }

  listExceptionRecord(params?: HttpParams): Observable<ExceptionRecord[]> {
    return this.http.get<ExceptionRecord[]>(`${SHARE_API_URL}/exceptionRecords`, {params});
  }

  listNotification(params?: HttpParams): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${SHARE_API_URL}/notifications`, {params});
  }

  getWorkshop_ProductPlans(id: string): Observable<WorkshopProductPlanReport> {
    return this.http.get<WorkshopProductPlanReport>(`${SHARE_API_URL}/workshops/${id}/productPlans`)
      .pipe(map(WorkshopProductPlanReport.assign));
  }
}
