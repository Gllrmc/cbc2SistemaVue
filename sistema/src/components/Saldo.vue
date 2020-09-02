<template>
    <v-row align="start">
        <v-col>
            <v-data-table
            :headers="headers"
            :items="lotes"
            :search="search"
            class="elevation-1"
            no-data-text="Nada para mostrar"
            >
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <div class="ma-2">
                        <v-btn small @click="crearPDF()"><v-icon>print</v-icon></v-btn>
                    </div>
                    <v-toolbar-title>Saldos de Períodos</v-toolbar-title>
                    <v-snackbar
                        v-model="snackbar"
                        :timeout="timeout"
                        right
                        color="error"
                        >
                        {{ snacktext }}
                        <v-btn 
                            color="error"
                            dark
                            vertical
                            text
                            @click="snackbar = false"
                        >
                            Cerrar
                        </v-btn>
                    </v-snackbar>                   
                    <v-divider
                        class="mx-4"
                        inset
                        vertical
                    ></v-divider>
                    <v-spacer></v-spacer>
                    <v-text-field label="Búsqueda" outlined v-model="search" append-icon="search" single-line hide-details></v-text-field>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="600px">
                        <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark class="mb-2" v-on="on">Nuevo</v-btn>
                        </template>
                        <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container grid-list-md>
                                <v-row dense>
                                    <template v-if="editedIndex==-1">
                                        <v-col cols="12" sm="12" md="12">
                                            <v-autocomplete 
                                                v-model="empresaId"
                                                clearable
                                                :items = "empresas"
                                                @click="asocuentaId=''"
                                                label="Empresa">
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="9" md="9">
                                            <v-autocomplete 
                                                v-model="asocuentaId"
                                                clearable
                                                :items = "asocuentas"
                                                @click="filtrarFecha()"
                                                label="Asociacion cuentas">
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="11" sm="3">
                                            <v-menu
                                                ref="menu"
                                                v-model="menu"
                                                :close-on-content-click="false"
                                                :return-value.sync="date"
                                                transition="scale-transition"
                                                offset-y
                                                max-width="290px"
                                                min-width="290px"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                <v-text-field
                                                    v-model="date"
                                                    label="Año / Mes"
                                                    prepend-icon="event"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"
                                                ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    v-model="date"
                                                    type="month"
                                                    no-title
                                                    scrollable
                                                    locale="es-AR"
                                                    >
                                                    <v-spacer></v-spacer>
                                                    <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                                                    <v-btn text color="primary" @click="$refs.menu.save(date)">OK</v-btn>
                                                </v-date-picker>
                                            </v-menu>
                                        </v-col>
                                    </template>
                                    <template v-else>
                                        <v-col cols="12" sm="12" md="12">
                                            <v-autocomplete 
                                                v-model="empresaId"
                                                clearable
                                                :items = "empresas"
                                                disabled
                                                label="Empresa"
                                            >
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="9" md="9">
                                            <v-autocomplete 
                                                v-model="asocuentaId"
                                                clearable
                                                :items = "asocuentas"
                                                disabled
                                                label="Asociacion cuentas"
                                            >
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="11" sm="3">
                                            <v-menu
                                                ref="menu"
                                                v-model="menu"
                                                :close-on-content-click="false"
                                                :return-value.sync="date"
                                                transition="scale-transition"
                                                offset-y
                                                disabled
                                                max-width="290px"
                                                min-width="290px"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                <v-text-field
                                                    v-model="date"
                                                    label="Año / Mes"
                                                    prepend-icon="event"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    disabled
                                                ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    v-model="date"
                                                    type="month"
                                                    no-title
                                                    scrollable
                                                    locale="es-AR"
                                                    >
                                                    <v-spacer></v-spacer>
                                                    <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                                                    <v-btn text color="primary" @click="$refs.menu.save(date)">OK</v-btn>
                                                </v-date-picker>
                                            </v-menu>
                                        </v-col>
                                    </template>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="consalini" label="Saldo Inicial Contable"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="bansalini" label="Saldo Inicial Banco"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="consalfin" label="Saldo Final Contable"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="bansalfin" label="Saldo Final Banco"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="12" v-show="valida">
                                        <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v">
                                        </div>
                                    </v-col> 
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                            <v-btn color="blue darken-1" text @click="guardar">Guardar</v-btn>
                        </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="adModal" max-width="290">
                        <v-card>
                            <v-card-title class="headline" v-if="adAccion==1">¿Activar Lote de Saldos?</v-card-title>
                            <v-card-title class="headline" v-if="adAccion==2">Bloquear Lote de Saldos?</v-card-title>
                            <v-card-text>
                                Estás a punto de 
                                <span v-if="adAccion==1">Activar </span>
                                <span v-if="adAccion==2">Bloquear </span>
                                el Lote de Saldos{{ adNombre }}
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer/>
                                <v-btn small @click="activarDesactivarCerrar">Cancel
                                <v-icon>cancel</v-icon>
                                </v-btn>
                                <v-btn small v-if="adAccion==1" @click="activar">Activar
                                <v-icon>lock_open</v-icon>
                                </v-btn>
                                <v-btn small v-if="adAccion==2" @click="desactivar">Bloquear
                                <v-icon>lock</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                >
                edit
                </v-icon>
                <v-icon
                small
                @click="deleteItem(item)"
                >
                delete
                </v-icon>
                    <template v-if="item.activo">
                        <v-icon
                        small
                        @click="activarDesactivarMostrar(2,item)"
                        >
                        block
                        </v-icon>
                    </template>
                    <template v-else>
                        <v-icon
                        small
                        @click="activarDesactivarMostrar(1,item)"
                        >
                        check
                        </v-icon>
                </template>
            </template>
            <template v-slot:[`item.activo`]="{ item }">
                <td>
                    <div v-if="item.activo">
                        <span class="blue--text">Activo</span>
                    </div>
                    <div v-else>
                        <span class="red--text">Inactivo</span>
                    </div>
                </td>
            </template>
            <template v-slot:[`item.consalini`]="{ item }">
                <v-chip class="ma-2" color="teal" text-color="white" >{{ formatPrice(item.consalini)}}</v-chip>
            </template>
            <template v-slot:[`item.consalfin`]="{ item }">
                <v-chip class="ma-2" color="teal" text-color="white" >{{ formatPrice(item.consalfin)}}</v-chip>
            </template>
            <template v-slot:[`item.bansalini`]="{ item }">
                <v-chip class="ma-2" color="secondary" text-color="white" >{{ formatPrice(item.bansalini)}}</v-chip>
            </template>
            <template v-slot:[`item.bansalfin`]="{ item }">
                <v-chip class="ma-2" color="secondary" text-color="white" >{{ formatPrice(item.bansalfin)}}</v-chip>
            </template>
            <template v-slot:[`item.fecalta`]="{ item }">
                <td>{{ item.fecalta.substr(0, 16) }}</td>
            </template>
            <template v-slot:[`item.fecumod`]="{ item }">
                <td>{{ item.fecumod.substr(0, 16) }}</td>
            </template>
            <template v-slot:no-data>
                <v-btn color="primary" @click="listar">Resetear</v-btn>
            </template>
            </v-data-table>

        </v-col>
    </v-row>
</template>
<script>
  import axios from 'axios'
  import jsPDF from 'jspdf'
  import autoTable from 'jspdf-autotable';
  export default {
    data: () => ({
        snackbar:false,
        snacktext: '',
        timeout: 4000,
        date: new Date().toISOString().substr(0, 7),
        menu: false,
        lotes: [],
        empresas: [],
        asocuentas: [],
        dialog: false,
        headers: [
            { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
            { text: 'Lote#', value: 'id', align: 'center', sortable: true },
            { text: 'Empresa', value: 'empresa', align: 'start', sortable: true },
            { text: 'Cuentas Asociadas', value: 'asocuenta', align: 'start', sortable: true },
            { text: 'Año/Mes', value: 'aniomes', align: 'center', sortable: true },
            { text: 'S.Ini.Conta', value: 'consalini', align: 'right', sortable: true },
            { text: 'S.Fin.Conta', value: 'consalfin', align: 'right', sortable: true },
            { text: 'S.Ini.Banco', value: 'bansalini', align: 'right', sortable: true },
            { text: 'S.Fin.Banco', value: 'bansalfin', align: 'right', sortable: true },
            { text: 'Estado', value: 'activo', align: 'center', sortable: true  },
            { text: 'Creador Id', value: 'iduseralta', sortable: true },
            { text: 'Fecha Hora Creación', value: 'fecalta', sortable: true },
            { text: 'Mod. Id', value: 'iduserumod', sortable: true },
            { text: 'Fecha Hora Ult.Mod.', value: 'fecumod', sortable: true }                   
        ],
        search:'',
        editedIndex: -1,
        id: '',
        empresaId: '',
        empresa: '',
        asocuentaId: '',
        asocuenta: '',
        anio: '',
        mes: '',
        aniomes: '',
        consalini: 0.00,
        consalfin: 0.00,
        bansalini: 0.00,
        bansalfin: 0.00,
        iduseralta:'',
        fecalta:'',
        iduserumod:'',
        fecumod:'',
        activo:false,                 
        valida: 0,
        validaMensaje:[],
        adModal: 0,
        adAccion: 0,
        adNombre: '',
        adId: ''             
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Lote de Saldos' : 'Actualizar Lote de Saldos'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
    },

    created () {
        this.select();
        this.listar()
    },

    methods: {
        formatPrice(value) {
            let val = (value/1).toFixed(2).replace('.', ',')
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        },
        filtrarFecha() {

        },
        crearPDF(){
            var columns = [
                {title: "Empresa", dataKey: "empresa"},
                {title: "Cuentas", dataKey: "asocuenta"},
                {title: "Año/Mes", dataKey: "aniomes"},
                {title: "SI Contable", dataKey: "consalini", styles: { halign: 'right' }},
                {title: "SF Contable", dataKey: "consalfin", styles: { halign: 'right' }},
                {title: "SI Banco", dataKey: "bansalini", styles: { halign: 'right' }},
                {title: "SF Banco", dataKey: "bansalfin", styles: { halign: 'right' }},
                {title: "Activo", dataKey: "activo"}
            ];
            var rows = [];

            this.lotes.map(function(x){
                rows.push({empresa:x.empresa,asocuenta:x.asocuenta,aniomes:x.aniomes,consalini:x.consalini.toFixed(2),consalfin:x.consalfin.toFixed(2),bansalini:x.bansalini.toFixed(2),bansalfin:x.bansalfin.toFixed(2),activo:x.activo});
            });

            // Only pt supported (not mm or in)
            var doc = new jsPDF('l', 'pt');
            doc.autoTable(columns, rows, {
                margin: {top: 60},
                addPageContent: function(data) {
                    doc.text("Listado de Lotes de Saldos", 40, 30);
                },
                columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right'  } } ,
            });
            doc.save('LotesSaldos.pdf');
        },
        listar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            // console.log(configuracion);
            axios.get('api/Lotes/Listar',configuracion).then(function(response){
                // console.log(response);
                me.lotes=response.data;
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        select(){
            let me=this;
            var empresasArray=[];
            var asocuentasArray=[];
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Empresas/Select',configuracion).then(function(response){
                // console.log(response);
                empresasArray=response.data;
                empresasArray.map(function(x){
                    me.empresas.push({text: x.nombre,value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
            axios.get('api/Asocuentas/Select',configuracion).then(function(response){
                // console.log(response);
                asocuentasArray=response.data;
                asocuentasArray.map(function(x){
                    me.asocuentas.push({text: x.descripcion,value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },            
        editItem (item) {
                this.id=item.id;
                this.empresaId=item.empresaId;
                this.asocuentaId=item.asocuentaId;
                this.anio=item.anio;
                this.mes=item.mes;
                this.date=new Date(this.anio, this.mes - 1, 1, 0, 0, 0, 0).toISOString().substr(0, 7);
                this.consalini=item.consalini;
                this.consalfin=item.consalfin;
                this.bansalini=item.bansalini;
                this.bansalfin=item.bansalfin;
                this.fecalta=item.fecalta;
                this.iduserumod=item.iduserumod;
                this.fecumod=item.fecumod;
                this.activo=item.activo;                
                this.editedIndex=1;
                this.dialog = true
        },
        deleteItem (item) {
            var me=this;
            var resulta = confirm('Esta seguro de querer borrar el registro?');
            if (resulta) {
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                axios.delete('api/Lotes/Eliminar/'+item.id,configuracion).then(function(response){
                    me.close();
                    me.listar();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            }
        },
        close () {
            this.dialog = false
            this.limpiar();

        },
        limpiar(){
            this.id="";
            this.empresaId="";
            this.asocuentaId="";
            this.anio="";
            this.mes="";
            this.date=new Date().toISOString().substr(0, 7)
            this.consalini=0.00;
            this.consalfin=0.00;
            this.bansalini=0.00;
            this.bansalfin=0.00;
            this.iduseralta = "";
            this.fecalta = "";
            this.iduserumod = "";
            this.fecumod = "";
            this.activo = false;                  
            this.editedIndex=-1;
        },
        guardar () {
            let me=this;
            if (me.validar()){
                return;
            }
            var date = new Date();                
            let header={"Authorization" : "Bearer " + me.$store.state.token};
            let configuracion= {headers : header};
            if (me.editedIndex > -1) {
                //Código para editar
                //Código para guardar
                axios.put('api/Lotes/Actualizar',{
                    'Id':me.id,
                    'empresaId':me.empresaId,
                    'asocuentaId':me.asocuentaId,
                    'anio':me.date.substr(0,4),
                    'mes':me.date.substr(5,2),
                    'consalini':me.consalini,
                    'consalfin':me.consalfin,
                    'bansalini':me.bansalini,
                    'bansalfin':me.bansalfin,
                    'iduserumod': me.$store.state.usuario.idusuario,
                    'fecumod': new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()                        
                },configuracion).then(function(response){
                    me.close();
                    me.listar();
                    me.limpiar();                        
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            } else {
                //Código para guardar
                axios.post('api/Lotes/Crear',{
                    'empresaId':me.empresaId,
                    'asocuentaId':me.asocuentaId,
                    'anio':me.date.substr(0,4),
                    'mes':me.date.substr(5,2),
                    'consalini':me.consalini,
                    'consalfin':me.consalfin,
                    'bansalini':me.bansalini,
                    'bansalfin':me.bansalfin,
                    'iduseralta': me.$store.state.usuario.idusuario                           
                },configuracion).then(function(response){
                    me.close();
                    me.listar();
                    me.limpiar();                        
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            }
        },
        validar(){
            this.valida=0;
            this.validaMensaje=[];
            if (!this.empresaId){
                this.validaMensaje.push("Selecciones una Empresa.");
            }
            if (!this.asocuentaId){
                this.validaMensaje.push("Seleccione un set de cuentas asociadas.");
            }
            if (!this.date){
                this.validaMensaje.push("Ingrese Año/Mes.");
            }
            if (this.validaMensaje.length){
                this.valida=1;
            }
            return this.valida;
        },

        activarDesactivarMostrar(accion,item){
            this.adModal=1;
            this.adNombre=item.nombre;
            this.adId=item.id;                
            if (accion==1){
                this.adAccion=1;
            }
            else if (accion==2){
                this.adAccion=2;
            }
            else{
                this.adModal=0;
            }
        },
        activarDesactivarCerrar(){
            this.adModal=0;
        },
        activar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.put('api/Lotes/Activar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listar();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        desactivar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.put('api/Lotes/Desactivar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listar();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        }
    },
  }
</script>
